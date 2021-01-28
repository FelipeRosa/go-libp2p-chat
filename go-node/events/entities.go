package events

import (
	"github.com/FelipeRosa/go-libp2p-chat/go-node/entities"
	apigen "github.com/FelipeRosa/go-libp2p-chat/go-node/gen/api"
)

// Event represents a node event.
type Event interface {
	MarshalToProtobuf() *apigen.Event
}

// NewMessage occurs when a new message is received from a subscribed room (pubsub topic).
type NewMessage struct {
	Message entities.Message
}

func (e *NewMessage) MarshalToProtobuf() *apigen.Event {
	return &apigen.Event{
		Type: apigen.Event_NEW_CHAT_MESSAGE,
		ChatMessage: &apigen.ChatMessage{
			SenderId:  e.Message.SenderID.Pretty(),
			Timestamp: e.Message.Timestamp.Unix(),
			Value:     e.Message.Value,
		},
	}
}
