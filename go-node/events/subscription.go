package events

import (
	"sync"

	"github.com/pkg/errors"
)

// Subscriber defines the event subscription receiver interface.
type Subscriber interface {
	// Next blocks until an event is received through the subscriber.
	Next() (Event, error)

	// Close closes the subscriber so it stops receiving new events.
	Close()
}

// Publisher defines the event subscription sender interface.
type Publisher interface {
	// Publish blocks until it is able to send the event through.
	Publish(Event) error

	// Closed checks whether the publisher is closed.
	Closed() bool
}

// NewSubscription creates a new event subscription.
func NewSubscription() (Publisher, Subscriber) {
	c := make(chan Event)
	doneC := make(chan struct{})

	pub := &publisher{
		c:     c,
		doneC: doneC,
	}

	// publisher must keep listening to doneC to see if the subscriber has been closed
	go pub.handleClose()

	sub := &subscriber{
		c:     c,
		doneC: doneC,
	}

	return pub, sub
}

type subscriber struct {
	c      <-chan Event
	doneC  chan<- struct{}
	closed bool
}

func (sub *subscriber) Next() (Event, error) {
	if sub.closed {
		return nil, errors.New("unable to receive next event: subscriber closed")
	}

	return <-sub.c, nil
}

func (sub *subscriber) Close() {
	// signal we are done so the owner of sub.c can stop sending new events
	sub.doneC <- struct{}{}
	close(sub.doneC)

	sub.closed = true
}

type publisher struct {
	c      chan<- Event
	doneC  <-chan struct{}
	closed bool

	lock sync.RWMutex
}

func (pub *publisher) Publish(evt Event) error {
	if pub.Closed() {
		return errors.New("unable to publish event: publisher closed")
	}

	select {
	case pub.c <- evt:
	case <-pub.doneC:
		return errors.New("subscriber closed while publishing")
	}

	return nil
}

func (pub *publisher) Closed() bool {
	pub.lock.RLock()
	defer pub.lock.RUnlock()

	return pub.closed
}

func (pub *publisher) handleClose() {
	<-pub.doneC

	pub.lock.Lock()
	defer pub.lock.Unlock()
	pub.closed = true
	close(pub.c)
}
