package events

import (
	"github.com/FelipeRosa/go-libp2p-chat/go-node/entities"
	apigen "github.com/FelipeRosa/go-libp2p-chat/go-node/gen/api"
	"github.com/libp2p/go-libp2p-core/peer"
)

// Event represents a node event.
type Event interface {
	// MarshalToProtobuf maps events into API protobuf events.
	MarshalToProtobuf() *apigen.Event
}

// NewMessage occurs when a new message is received from a subscribed room (pubsub topic).
type NewMessage struct {
	Message entities.Message
}

func (e *NewMessage) MarshalToProtobuf() *apigen.Event {
	return &apigen.Event{
		Type: apigen.Event_NEW_CHAT_MESSAGE,
		NewChatMessage: &apigen.EvtNewChatMessage{
			ChatMessage: &apigen.ChatMessage{SenderId: e.Message.SenderID.Pretty(),
				Timestamp: e.Message.Timestamp.Unix(),
				Value:     e.Message.Value,
			},
		},
	}
}

// PeerJoined occurs when a peer joins a room that we are subscribed to.
type PeerJoined struct {
	PeerID   peer.ID
	RoomName string
}

func (e *PeerJoined) MarshalToProtobuf() *apigen.Event {
	return &apigen.Event{
		Type: apigen.Event_PEER_JOINED,
		PeerJoined: &apigen.EvtPeerJoined{
			RoomName: e.RoomName,
			PeerId:   e.PeerID.Pretty(),
		},
	}
}

// PeerLeft occurs when a peer lefts a room that we are subscribed to.
type PeerLeft struct {
	PeerID   peer.ID
	RoomName string
}

func (e *PeerLeft) MarshalToProtobuf() *apigen.Event {
	return &apigen.Event{
		Type: apigen.Event_PEER_LEFT,
		PeerLeft: &apigen.EvtPeerLeft{
			RoomName: e.RoomName,
			PeerId:   e.PeerID.Pretty(),
		},
	}
}
