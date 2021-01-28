package node

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"

	"github.com/FelipeRosa/go-libp2p-chat/go-node/entities"
	"github.com/FelipeRosa/go-libp2p-chat/go-node/events"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

type RoomMessageType string

const (
	RoomMessageTypeChatMessage RoomMessageType = "chat.message"
)

type RoomMessageOut struct {
	Type    RoomMessageType `json:"type"`
	Payload interface{}     `json:"payload"`
}

type RoomMessageIn struct {
	Type    RoomMessageType `json:"type"`
	Payload json.RawMessage `json:"payload"`
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

	rooms map[string]*Room

	eventPublisher events.Publisher

	lock sync.RWMutex
}

// NewRoomManager creates a new room manager.
func NewRoomManager(logger *zap.Logger, node Node, ps *pubsub.PubSub) (*RoomManager, events.Subscriber) {
	if logger == nil {
		logger = zap.NewNop()
	}

	evtPub, evtSub := events.NewSubscription()

	return &RoomManager{
		logger:         logger,
		ps:             ps,
		node:           node,
		rooms:          make(map[string]*Room),
		eventPublisher: evtPub,
	}, evtSub
}

// JoinAndSubscribe joins and subscribes to a room.
func (r *RoomManager) JoinAndSubscribe(roomName string) (bool, error) {
	if r.HasJoined(roomName) {
		return false, nil
	}

	logger := r.logger.With(zap.String("topic", roomName))

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
	}

	room := &Room{
		topic:        topic,
		subscription: subscription,
	}

	r.putRoom(room)
	go r.roomHandler(room)

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

	rm := RoomMessageOut{
		Type:    RoomMessageTypeChatMessage,
		Payload: msg,
	}

	rmJSON, err := json.Marshal(rm)
	if err != nil {
		return errors.Wrap(err, "marshalling message")
	}

	if err := room.topic.Publish(ctx, rmJSON); err != nil {
		return err
	}
	return nil
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

func (r *RoomManager) roomHandler(room *Room) {
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

		default:
			r.logger.Warn(
				"ignoring room message",
				zap.Error(errors.New("unknown room message type")),
			)
		}
	}
}
