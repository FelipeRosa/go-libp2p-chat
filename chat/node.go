package chat

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"github.com/libp2p/go-libp2p"
	libp2phost "github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/peer"
	discovery "github.com/libp2p/go-libp2p-discovery"
	"github.com/libp2p/go-libp2p-kad-dht"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	"github.com/multiformats/go-multiaddr"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

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

type Node interface {
	Start(ctx context.Context, port uint16) error
	Bootstrap(ctx context.Context, nodeAddrs []multiaddr.Multiaddr) error
	SendMessage(ctx context.Context, msg string) error
	GetMessages() []Message
	SubscribeToNewMessages() *NewMessageSubscription
	JoinRoom(ctx context.Context, roomName string) error
	Shutdown() error
}

type node struct {
	logger *zap.Logger
	host   libp2phost.Host
	kadDHT *dht.IpfsDHT

	ps           *pubsub.PubSub
	topic        *pubsub.Topic
	subscription *pubsub.Subscription
	messageStore *MessageStore

	newMessageSubscriptionsLock sync.Mutex
	newMessageSubscriptions     []*NewMessageSubscription

	findPeersDoneChan chan<- struct{}
	findPeersErrChan  <-chan error
}

func NewNode(logger *zap.Logger) Node {
	if logger == nil {
		logger = zap.NewNop()
	}

	return &node{
		logger:       logger,
		host:         nil,
		messageStore: NewMessageStore(3),
	}
}

func (n *node) Start(ctx context.Context, port uint16) error {
	nodeAddrStrings := []string{fmt.Sprintf("/ip4/0.0.0.0/tcp/%d", port)}

	n.logger.Debug("creating libp2p host")
	host, err := libp2p.New(ctx, libp2p.ListenAddrStrings(nodeAddrStrings...))
	if err != nil {
		return errors.Wrap(err, "creating libp2p host")
	}
	n.host = host

	n.logger.Debug("creating pubsub")
	ps, err := pubsub.NewGossipSub(ctx, n.host)
	if err != nil {
		return errors.Wrap(err, "creating pubsub")
	}
	n.ps = ps

	p2pAddr, err := multiaddr.NewMultiaddr(fmt.Sprintf("/p2p/%s", host.ID().Pretty()))
	if err != nil {
		return errors.Wrap(err, "creating host p2p multiaddr")
	}

	var fullAddrs []string
	for _, addr := range host.Addrs() {
		fullAddrs = append(fullAddrs, addr.Encapsulate(p2pAddr).String())
	}

	n.logger.Info("started chat node", zap.Strings("p2pAddresses", fullAddrs))
	return nil
}

func (n *node) Bootstrap(ctx context.Context, nodeAddrs []multiaddr.Multiaddr) error {
	var bootstrappers []peer.AddrInfo
	for _, nodeAddr := range nodeAddrs {
		pi, err := peer.AddrInfoFromP2pAddr(nodeAddr)
		if err != nil {
			return errors.Wrap(err, "parsing bootstrapper node address info from p2p address")
		}

		bootstrappers = append(bootstrappers, *pi)
	}

	n.logger.Debug("creating routing DHT")
	kadDHT, err := dht.New(
		ctx,
		n.host,
		dht.BootstrapPeers(bootstrappers...),
		dht.ProtocolPrefix(ProtocolID),
		dht.Mode(dht.ModeAutoServer),
	)
	if err != nil {
		return errors.Wrap(err, "creating routing DHT")
	}
	n.kadDHT = kadDHT

	if err := kadDHT.Bootstrap(ctx); err != nil {
		return errors.Wrap(err, "bootstrapping DHT")
	}

	if len(nodeAddrs) == 0 {
		return nil
	}

	// connect to bootstrap nodes
	for _, pi := range bootstrappers {
		if err := n.host.Connect(ctx, pi); err != nil {
			return errors.Wrap(err, "connecting to bootstrap node")
		}
	}

	rd := discovery.NewRoutingDiscovery(kadDHT)

	n.logger.Info("starting advertising thread")
	if _, err := rd.Advertise(ctx, DiscoveryNamespace); err != nil {
		return errors.Wrap(err, "starting advertising thread")
	}

	peersChan, err := rd.FindPeers(ctx, DiscoveryNamespace)
	if err != nil {
		return errors.Wrap(err, "starting find peers thread")
	}

	findPeersDoneChan := make(chan struct{})
	findPeersErrChan := make(chan error)
	n.findPeersDoneChan = findPeersDoneChan
	n.findPeersErrChan = findPeersErrChan

	go func(peersChan <-chan peer.AddrInfo, errChan chan<- error, doneChan <-chan struct{}) {
		var done bool
		for !done {
			select {
			case <-doneChan:
				done = true

			case pi := <-peersChan:
				if pi.ID == "" || pi.ID == n.host.ID() {
					continue
				}

				var addrStrings []string
				for _, addr := range pi.Addrs {
					addrStrings = append(addrStrings, addr.String())
				}

				n.logger.Info("found peer",
					zap.String("ID", pi.ID.Pretty()),
					zap.Strings("addresses", addrStrings),
				)
			}
		}
	}(peersChan, findPeersErrChan, findPeersDoneChan)

	go func() {
		for err := range n.findPeersErrChan {
			n.logger.Error("peer thread error", zap.Error(err))
		}
	}()

	return nil
}

func (n *node) SendMessage(ctx context.Context, msg string) error {
	m := Message{
		SenderID:  n.host.ID(),
		Timestamp: time.Now(),
		Value:     msg,
	}

	msgJSON, err := json.Marshal(m)
	if err != nil {
		return errors.Wrap(err, "marshalling message")
	}

	if err := n.topic.Publish(ctx, msgJSON); err != nil {
		return errors.Wrap(err, "publishing message")
	}

	return nil
}

func (n *node) GetMessages() []Message {
	return n.messageStore.Messages()
}

func (n *node) SubscribeToNewMessages() *NewMessageSubscription {
	sub := &NewMessageSubscription{
		messageCh: make(chan Message),
		doneCh:    make(chan struct{}, 1),
	}

	defer n.newMessageSubscriptionsLock.Unlock()
	n.newMessageSubscriptionsLock.Lock()
	n.newMessageSubscriptions = append(n.newMessageSubscriptions, sub)

	return sub
}

func (n *node) JoinRoom(ctx context.Context, roomName string) error {
	if n.subscription != nil {
		return errors.New("changing rooms is not implemented yet")
	}

	n.logger.Debug("joining room topic", zap.String("name", roomName))
	roomTopic, err := n.ps.Join(roomName)
	if err != nil {
		return errors.Wrap(err, "joining room topic")
	}

	n.logger.Debug("subscribing to room topic", zap.String("name", roomName))
	roomSubscription, err := roomTopic.Subscribe()
	if err != nil {
		return errors.Wrap(err, "subscribing to room topic")
	}

	shouldStartSubLoop := n.subscription == nil

	n.topic = roomTopic
	n.subscription = roomSubscription

	if shouldStartSubLoop {
		go n.roomSubLoop(ctx)
	}

	return nil
}

func (n *node) Shutdown() error {
	// kill find peers goroutine
	if n.findPeersDoneChan != nil {
		close(n.findPeersDoneChan)
	}

	return n.host.Close()
}

func (n *node) roomSubLoop(ctx context.Context) {
	for {
		subMsg, err := n.subscription.Next(ctx)
		if err != nil {
			n.logger.Error("failed receiving room message", zap.Error(err))
			continue
		}

		if subMsg.ReceivedFrom == n.host.ID() {
			continue
		}

		var msg Message
		if err := json.Unmarshal(subMsg.Data, &msg); err != nil {
			n.logger.Warn("skipping message: failed unmarshalling")
			continue
		}
		n.messageStore.Push(msg)

		n.publishNewMessageToSubscribers(msg)
	}
}

func (n *node) publishNewMessageToSubscribers(msg Message) {
	defer n.newMessageSubscriptionsLock.Unlock()
	n.newMessageSubscriptionsLock.Lock()

	var subscriptions []*NewMessageSubscription

	// Filter out closed subscriptions
	for _, sub := range n.newMessageSubscriptions {
		select {
		case <-sub.doneCh:
			close(sub.messageCh)

		default:
			subscriptions = append(subscriptions, sub)
		}
	}
	n.newMessageSubscriptions = subscriptions

	for _, sub := range n.newMessageSubscriptions {
		// Try publishing. Subscription will miss the message if blocked.
		select {
		case sub.messageCh <- msg:
		}
	}
}
