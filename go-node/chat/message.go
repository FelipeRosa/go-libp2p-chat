package chat

import (
	"sync"
	"time"

	"github.com/libp2p/go-libp2p-core/peer"
)

type Message struct {
	SenderID  peer.ID   `json:"sender_id"`
	Timestamp time.Time `json:"timestamp"`
	Value     string    `json:"value"`
}

// MessageStore stores a limited number of messages.
//
// When messages get pushed into the store, only the most recent (compared by timestamp) are kept. Messages are store
// sorted by timestamp.
//
// Thread-safe.
type MessageStore struct {
	lock sync.Mutex

	maxSize  int
	messages []Message
}

func NewMessageStore(maxSize int) *MessageStore {
	return &MessageStore{
		maxSize:  maxSize,
		messages: nil,
	}
}

func (s *MessageStore) Push(msg Message) {
	defer s.lock.Unlock()
	s.lock.Lock()

	var ix int
	for i, m := range s.messages {
		ix = i

		if m.Timestamp.After(msg.Timestamp) {
			break
		}

		ix++
	}

	if len(s.messages) == ix {
		s.messages = append(s.messages, msg)
	} else {
		s.messages = append(s.messages[0:ix+1], s.messages[ix:]...)
		s.messages[ix] = msg
	}

	if len(s.messages) > s.maxSize {
		s.messages = s.messages[1:]
	}
}

func (s *MessageStore) Messages() []Message {
	defer s.lock.Unlock()
	s.lock.Lock()

	msgs := make([]Message, len(s.messages))
	copy(msgs, s.messages)

	return msgs
}

func (s *MessageStore) Len() int {
	defer s.lock.Unlock()
	s.lock.Lock()

	return len(s.messages)
}
