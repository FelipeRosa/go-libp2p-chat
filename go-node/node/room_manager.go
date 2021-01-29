package node

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"github.com/FelipeRosa/go-libp2p-chat/go-node/entities"
	"github.com/FelipeRosa/go-libp2p-chat/go-node/events"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

type setNicknameReq struct {
	room     *Room
	roomName string
	nickname string
}

// RoomMessageType enumerates the possible types of pubsub room messages.
type RoomMessageType string

const (
	// RoomMessageTypeChatMessage is published when a new chat message is sent from the node.
	RoomMessageTypeChatMessage RoomMessageType = "room.message"

	// RoomMessageTypeNickname is published when a node set its nickname in a room.
	RoomMessageTypeNickname RoomMessageType = "room.nickname"
)

// RoomMessageOut holds data to be published in a topic.
type RoomMessageOut struct {
	Type    RoomMessageType `json:"type"`
	Payload interface{}     `json:"payload,omitempty"`
}

// RoomMessageIn holds data to be received from a topic.
//
// The Payload field is lazily unmarshalled because it depends on the type of message published.
type RoomMessageIn struct {
	Type    RoomMessageType `json:"type"`
	Payload json.RawMessage `json:"payload,omitempty"`
}

// Room holds room event and pubsub data.
type Room struct {
	topic        *pubsub.Topic
	subscription *pubsub.Subscription
}

// RoomManager manages rooms through pubsub subscription and implements room operations.
type RoomManager struct {
	logger *zap.Logger
	ps     *pubsub.PubSub
	node   Node
	kadDHT *dht.IpfsDHT

	rooms map[string]*Room

	eventPublisher events.Publisher

	lock sync.RWMutex

	nicknameCh chan setNicknameReq
}

// NewRoomManager creates a new room manager.
func NewRoomManager(logger *zap.Logger, node Node, kadDHT *dht.IpfsDHT, ps *pubsub.PubSub) (*RoomManager, events.Subscriber) {
	if logger == nil {
		logger = zap.NewNop()
	}

	evtPub, evtSub := events.NewSubscription()

	mngr := &RoomManager{
		logger:         logger,
		ps:             ps,
		node:           node,
		kadDHT:         kadDHT,
		rooms:          make(map[string]*Room),
		eventPublisher: evtPub,
		nicknameCh:     make(chan setNicknameReq),
	}
	go mngr.setNicknameHandler()

	return mngr, evtSub
}

// JoinAndSubscribe joins and subscribes to a room.
func (r *RoomManager) JoinAndSubscribe(roomName string) (bool, error) {
	if r.HasJoined(roomName) {
		return false, nil
	}

	logger := r.logger.With(zap.String("topic", roomName))

	cleanup := func(topic *pubsub.Topic, subscription *pubsub.Subscription) {
		if topic != nil {
			_ = topic.Close()
		}
		if subscription != nil {
			subscription.Cancel()
		}
	}

	logger.Debug("joining room topic")
	topicName := r.TopicName(roomName)
	topic, err := r.ps.Join(topicName)
	if err != nil {
		logger.Debug("failed joining room topic")
		return false, err
	}

	logger.Debug("subscribing to room topic")
	subscription, err := topic.Subscribe()
	if err != nil {
		logger.Debug("failed subscribing to room topic")

		cleanup(topic, subscription)
		return false, err
	}

	room := &Room{
		topic:        topic,
		subscription: subscription,
	}

	r.putRoom(room)
	go r.roomTopicEventHandler(room)
	go r.roomSubscriptionHandler(room)

	logger.Debug("successfully joined room")
	return true, nil
}

// HasJoined returns whether the manager has joined a given room.
func (r *RoomManager) HasJoined(roomName string) bool {
	r.lock.RLock()
	defer r.lock.RUnlock()

	_, found := r.rooms[r.TopicName(roomName)]
	return found
}

// TopicName builds a string containing the name of the pubsub topic for a given room name.
func (r *RoomManager) TopicName(roomName string) string {
	return fmt.Sprintf("chat/room/%s", roomName)
}

// SendChatMessage sends a chat message to a given room.
// Fails if it has not yet joined the given room.
func (r *RoomManager) SendChatMessage(ctx context.Context, roomName string, msg entities.Message) error {
	room, found := r.getRoom(roomName)
	if !found {
		return errors.New(fmt.Sprintf("must join room before sending messages"))
	}

	rm := &RoomMessageOut{
		Type:    RoomMessageTypeChatMessage,
		Payload: msg,
	}

	if err := r.publishRoomMessage(ctx, room, rm); err != nil {
		return err
	}

	return nil
}

// SetNickname sets the node's nickname in a given room.
func (r *RoomManager) SetNickname(roomName string, nickname string) error {
	room, found := r.getRoom(roomName)
	if !found {
		return errors.New("must join a room before setting nickname")
	}

	r.nicknameCh <- setNicknameReq{
		room:     room,
		roomName: roomName,
		nickname: nickname,
	}
	return nil
}

// GetNickname tries to find the nickname of a peer in the DHT.
func (r *RoomManager) GetNickname(
	ctx context.Context,
	roomName string,
	peerID string,
) (string, error) {
	nickname, err := r.kadDHT.GetValue(
		ctx,
		fmt.Sprintf("%s/%s/nickname/%s", DiscoveryNamespace, roomName, peerID),
	)
	if err != nil {
		return "", errors.Wrap(err, "getting peer nickname from DHT")
	}
	return string(nickname), nil
}

func (r *RoomManager) putRoom(room *Room) {
	r.lock.Lock()
	defer r.lock.Unlock()

	r.rooms[room.topic.String()] = room
}

func (r *RoomManager) getRoom(roomName string) (*Room, bool) {
	r.lock.RLock()
	defer r.lock.RUnlock()

	room, found := r.rooms[r.TopicName(roomName)]
	return room, found
}

func (r *RoomManager) roomTopicEventHandler(room *Room) {
	handler, err := room.topic.EventHandler()
	if err != nil {
		r.logger.Error("failed getting room topic event handler", zap.Error(err))
	}

	for {
		peerEvt, err := handler.NextPeerEvent(context.Background())
		if err != nil {
			r.logger.Error("failed receiving room topic peer event", zap.Error(err))
			continue
		}

		var evt events.Event

		switch peerEvt.Type {
		case pubsub.PeerJoin:
			evt = &events.PeerJoined{
				PeerID:   peerEvt.Peer,
				RoomName: room.topic.String(),
			}

		case pubsub.PeerLeave:
			evt = &events.PeerLeft{
				PeerID:   peerEvt.Peer,
				RoomName: room.topic.String(),
			}
		}

		if evt == nil {
			continue
		}

		if err := r.eventPublisher.Publish(evt); err != nil {
			r.logger.Error("failed publishing room manager event", zap.Error(err))
		}
	}
}

func (r *RoomManager) roomSubscriptionHandler(room *Room) {
	for {
		subMsg, err := room.subscription.Next(context.Background())
		if err != nil {
			r.logger.Error("failed receiving room message", zap.Error(err))
			continue
		}

		if subMsg.ReceivedFrom == r.node.ID() {
			continue
		}

		var rm RoomMessageIn
		if err := json.Unmarshal(subMsg.Data, &rm); err != nil {
			r.logger.Warn("ignoring room message", zap.Error(err))
		}

		switch rm.Type {
		case RoomMessageTypeChatMessage:
			var chatMessage entities.Message
			if err := json.Unmarshal(rm.Payload, &chatMessage); err != nil {
				r.logger.Warn(
					"ignoring message",
					zap.Error(errors.Wrap(err, "unmarshalling payload")),
				)
				continue
			}

			if err := r.eventPublisher.Publish(&events.NewMessage{Message: chatMessage}); err != nil {
				r.logger.Error("failed publishing room manager event", zap.Error(err))
			}

		case RoomMessageTypeNickname:
			var nicknameEvt events.SetNickname
			if err := json.Unmarshal(rm.Payload, &nicknameEvt); err != nil {
				r.logger.Warn("ignoring message", zap.Error(errors.Wrap(
					err,
					"unmarshalling payload",
				)))
				continue
			}

			if err := r.eventPublisher.Publish(&nicknameEvt); err != nil {
				r.logger.Error("failed publishing room manager event", zap.Error(err))
			}

		default:
			r.logger.Warn(
				"ignoring room message",
				zap.Error(errors.New("unknown room message type")),
			)
		}
	}
}

func (r *RoomManager) publishRoomMessage(
	ctx context.Context,
	room *Room,
	rm *RoomMessageOut,
) error {
	rmJSON, err := json.Marshal(rm)
	if err != nil {
		return errors.Wrap(err, "marshalling message")
	}

	if err := room.topic.Publish(ctx, rmJSON); err != nil {
		return err
	}

	return nil
}

func (r *RoomManager) setNicknameHandler() {
	ctx := context.Background()

	for {
		req := <-r.nicknameCh

		for {
			// Wait until we have some peers
			if r.kadDHT.RoutingTable().Size() == 0 {
				r.logger.Debug("waiting for peers to store nickname")
				<-time.After(time.Second)
				continue
			}

			break
		}

		r.logger.Debug("storing nickname in DHT")
		err := r.kadDHT.PutValue(
			ctx,
			fmt.Sprintf("%s/%s/nickname/%s", DiscoveryNamespace, req.roomName, r.node.ID().Pretty()),
			[]byte(req.nickname),
		)
		if err != nil {
			r.logger.Error("failed storing nickname in DHT", zap.Error(err))
			continue
		}

		rm := &RoomMessageOut{
			Type: RoomMessageTypeNickname,
			Payload: events.SetNickname{
				RoomName: req.roomName,
				PeerID:   r.node.ID(),
				Nickname: req.nickname,
			},
		}
		if err := r.publishRoomMessage(ctx, req.room, rm); err != nil {
			r.logger.Error("failed to publishing room manager event", zap.Error(err))
		}
	}
}
