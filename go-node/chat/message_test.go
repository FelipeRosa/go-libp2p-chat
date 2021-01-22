package chat

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestMessageStore_Push(t *testing.T) {
	expectedMsgs := []Message{
		{
			SenderID:  "1",
			Timestamp: time.Unix(1, 0),
			Value:     "a",
		},
		{
			SenderID:  "1",
			Timestamp: time.Unix(2, 0),
			Value:     "b",
		},
		{
			SenderID:  "2",
			Timestamp: time.Unix(3, 0),
			Value:     "c",
		},
	}

	s := NewMessageStore(2)
	for _, msg := range expectedMsgs {
		s.Push(msg)
	}

	msgs := s.Messages()

	assert.Equal(t, []Message{expectedMsgs[1], expectedMsgs[2]}, msgs)
}
