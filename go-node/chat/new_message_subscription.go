package chat

type NewMessageSubscription struct {
	messageCh chan Message
	doneCh    chan struct{}
	closed    bool
}

func (sub *NewMessageSubscription) Channel() <-chan Message {
	return sub.messageCh
}

func (sub *NewMessageSubscription) Close() {
	sub.doneCh <- struct{}{}
	sub.closed = true
}

func (sub *NewMessageSubscription) Closed() bool {
	return sub.closed
}
