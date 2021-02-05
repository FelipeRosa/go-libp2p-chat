package node

import (
	"context"
	"encoding/json"
	"fmt"
	"math"
	"sync"
	"time"

	"github.com/FelipeRosa/go-libp2p-chat/go-node/entities"
	"github.com/FelipeRosa/go-libp2p-chat/go-node/events"
	"github.com/libp2p/go-libp2p-core/peer"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

const (
	roomParticipantsTTLPermanent = math.MaxInt64
	roomParticipantsTTL          = time.Second * 10
)

type participantsEntry struct {
	ID       peer.ID `json:"id"`
	Nickname string  `json:"nickname"`

	ttl     time.Duration
	addedAt time.Time
}

// RoomMessageType enumerates the possible types of pubsub room messages.
type RoomMessageType string

const (
	// RoomMessageTypeChatMessage is published when a new chat message is sent from the node.
	RoomMessageTypeChatMessage RoomMessageType = "room.message"

	// RoomMessageTypeAdvertise is published to indicate a node is still connected to a room.
	RoomMessageTypeAdvertise RoomMessageType = "room.advertise"
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
	name         string
	topic        *pubsub.Topic
	subscription *pubsub.Subscription

	lock         sync.RWMutex
	participants map[peer.ID]*participantsEntry
}

func newRoom(name string, topic *pubsub.Topic, subscription *pubsub.Subscription) *Room {
	return &Room{
		name:         name,
		topic:        topic,
		subscription: subscription,
		participants: make(map[peer.ID]*participantsEntry),
	}
}

func (r *Room) addParticipant(peerID peer.ID, nickname string, ttl time.Duration) bool {
	r.lock.Lock()
	defer r.lock.Unlock()

	_, exists := r.participants[peerID]
	r.participants[peerID] = &participantsEntry{
		ID:       peerID,
		Nickname: nickname,

		ttl:     ttl,
		addedAt: time.Now(),
	}
	return exists
}

func (r *Room) removeParticipant(peerID peer.ID) bool {
	r.lock.Lock()
	defer r.lock.Unlock()

	if _, exists := r.participants[peerID]; !exists {
		return false
	}

	delete(r.participants, peerID)
	return true
}

func (r *Room) getParticipants() []participantsEntry {
	r.lock.RLock()
	defer r.lock.RUnlock()

	var participants []participantsEntry
	for _, p := range r.participants {
		participants = append(participants, *p)
	}

	return participants
}

func (r *Room) refreshParticipants(onRemove func(peer.ID)) {
	r.lock.Lock()
	defer r.lock.Unlock()

	for peerID, participant := range r.participants {
		if time.Now().Sub(participant.addedAt) <= participant.ttl {
			continue
		}

		// participant ttl expired
		delete(r.participants, peerID)
		onRemove(peerID)
	}
}

func (r *Room) setNickname(peerID peer.ID, nickname string) bool {
	r.lock.Lock()
	defer r.lock.Unlock()

	if p, found := r.participants[peerID]; found {
		p.Nickname = nickname
	}

	return false
}

func (r *Room) getNickname(peerID peer.ID) (string, bool) {
	r.lock.RLock()
	defer r.lock.RUnlock()

	if p, found := r.participants[peerID]; found {
		return p.Nickname, true
	}
	return "", false
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
	}
	go mngr.advertise()
	go mngr.refreshRoomsParticipants()

	return mngr, evtSub
}

// JoinAndSubscribe joins and subscribes to a room.
func (r *RoomManager) JoinAndSubscribe(roomName string, nickname string) (bool, error) {
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

	room := newRoom(roomName, topic, subscription)
	room.addParticipant(r.node.ID(), nickname, roomParticipantsTTLPermanent)

	r.putRoom(room)
	go r.roomTopicEventHandler(room)
	go r.roomSubscriptionHandler(room)

	r.advertiseToRoom(room)

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
		return errors.New(fmt.Sprintf("must join the room before sending messages"))
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
		return errors.New("must join the room before setting nickname")
	}

	room.setNickname(r.node.ID(), nickname)
	return nil
}

// GetNickname tries to find the nickname of a peer in the DHT.
func (r *RoomManager) GetNickname(
	roomName string,
	peerID peer.ID,
) (string, bool, error) {
	if room, found := r.getRoom(roomName); found {
		nickname, found := room.getNickname(peerID)
		return nickname, found, nil
	}

	return "", false, errors.New("must join the room before getting nicknames")
}

// GetRoomParticipants returns the list of peers in a room.
func (r *RoomManager) GetRoomParticipants(roomName string) ([]participantsEntry, error) {
	room, found := r.getRoom(roomName)
	if !found {
		return nil, errors.New("must join the room before getting participants")
	}

	// always append the node to the participants list
	return room.getParticipants(), nil
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
				RoomName: room.name,
			}
			room.addParticipant(peerEvt.Peer, "", roomParticipantsTTL)

		case pubsub.PeerLeave:
			evt = &events.PeerLeft{
				PeerID:   peerEvt.Peer,
				RoomName: room.name,
			}
			room.removeParticipant(peerEvt.Peer)
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

		case RoomMessageTypeAdvertise:
			var nickname string
			if err := json.Unmarshal(rm.Payload, &nickname); err != nil {
				r.logger.Warn("ignoring message", zap.Error(errors.Wrap(err, "unmarshalling payload")))
				continue
			}
			room.addParticipant(subMsg.ReceivedFrom, nickname, roomParticipantsTTL)

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

func (r *RoomManager) advertise() {
	tick := time.Tick(time.Second * 5)

	for {
		<-tick

		func() {
			r.lock.RLock()
			defer r.lock.RUnlock()

			for _, room := range r.rooms {
				r.advertiseToRoom(room)
			}
		}()
	}
}

func (r *RoomManager) advertiseToRoom(room *Room) {
	// fetch this node's nickname
	thisNickname, _ := room.getNickname(r.node.ID())

	rm := RoomMessageOut{
		Type:    RoomMessageTypeAdvertise,
		Payload: thisNickname,
	}

	if err := r.publishRoomMessage(context.Background(), room, &rm); err != nil {
		r.logger.Error(
			"failed publishing room advertise",
			zap.Error(err),
			zap.String("room", room.topic.String()),
		)
	}
}

func (r *RoomManager) refreshRoomsParticipants() {
	tick := time.Tick(time.Second)

	for {
		<-tick

		func() {
			r.lock.RLock()
			defer r.lock.RUnlock()

			for _, room := range r.rooms {
				room.refreshParticipants(func(peerID peer.ID) {
					// consider that if we haven't hear of this peer for a while, it disconnected from the room
					err := r.eventPublisher.Publish(&events.PeerLeft{
						PeerID:   peerID,
						RoomName: room.name,
					})
					if err != nil {
						r.logger.Error("failed publishing room manager event", zap.Error(err))
					}
				})
			}
		}()
	}
}
