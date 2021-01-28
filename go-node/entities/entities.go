package entities

import (
	"time"

	"github.com/libp2p/go-libp2p-core/peer"
)

type Message struct {
	SenderID  peer.ID   `json:"sender_id"`
	Timestamp time.Time `json:"timestamp"`
	Value     string    `json:"value"`
}