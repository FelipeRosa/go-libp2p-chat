package chat

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"sync"
	"time"

	"github.com/libp2p/go-libp2p"
	"github.com/libp2p/go-libp2p-core/crypto"
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

type validator struct{}

func (v *validator) Validate(string, []byte) error {
	return nil
}

func (v *validator) Select(string, [][]byte) (int, error) {
	return 0, nil
}

type Node interface {
	ID() string
	Start(ctx context.Context, port uint16) error
	Bootstrap(ctx context.Context, nodeAddrs []multiaddr.Multiaddr) error
	SendMessage(ctx context.Context, msg string) error
	GetMessages() ([]Message, error)
	SubscribeToNewMessages() (*NewMessageSubscription, error)
	JoinRoom(ctx context.Context, roomName string) error
	CurrentRoomName() (string, error)
	SetNickname(ctx context.Context, nickname string) error
	GetNickname(ctx context.Context, peerID string) (string, error)
	Shutdown() error
}

type node struct {
	logger *zap.Logger
	host   libp2phost.Host
	kadDHT *dht.IpfsDHT

	bootstrapOnly bool

	storeIdentity bool

	ps           *pubsub.PubSub
	topic        *pubsub.Topic
	subscription *pubsub.Subscription
	messageStore *MessageStore

	newMessageSubscriptionsLock sync.Mutex
	newMessageSubscriptions     []*NewMessageSubscription
	currentRoomName             string

	nicknameStoreMutex   sync.Mutex
	nicknameStoreWaiting bool

	findPeersDoneChan chan<- struct{}
	findPeersErrChan  <-chan error
}

func NewNode(logger *zap.Logger, boostrapOnly bool, storeIdentity bool) Node {
	if logger == nil {
		logger = zap.NewNop()
	}

	return &node{
		logger:        logger,
		host:          nil,
		bootstrapOnly: boostrapOnly,
		storeIdentity: storeIdentity,
		messageStore:  NewMessageStore(3),
	}
}

func (n *node) ID() string {
	if n.host == nil {
		return ""
	}
	return n.host.ID().Pretty()
}

func (n *node) Start(ctx context.Context, port uint16) error {
	n.logger.Info("starting chat node", zap.Bool("bootstrapOnly", n.bootstrapOnly))

	nodeAddrStrings := []string{fmt.Sprintf("/ip4/0.0.0.0/tcp/%d", port)}

	privKey, err := n.getPrivateKey()
	if err != nil {
		return err
	}

	n.logger.Debug("creating libp2p host")
	host, err := libp2p.New(
		ctx,
		libp2p.ListenAddrStrings(nodeAddrStrings...),
		libp2p.Identity(privKey),
	)
	if err != nil {
		return errors.Wrap(err, "creating libp2p host")
	}
	n.host = host

	n.logger.Debug("creating pubsub")
	ps, err := pubsub.NewGossipSub(ctx, n.host, pubsub.WithMessageSignaturePolicy(pubsub.StrictSign))
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
		dht.Validator(&validator{}),
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
	if n.bootstrapOnly {
		return errors.New("can't send message from a bootstrap-only node")
	}

	if n.topic == nil {
		return errors.New("not connected to a room")
	}

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

func (n *node) GetMessages() ([]Message, error) {
	if n.bootstrapOnly {
		return nil, errors.New("can't get messages from a bootstrap-only node")
	}

	return n.messageStore.Messages(), nil
}

func (n *node) SubscribeToNewMessages() (*NewMessageSubscription, error) {
	if n.bootstrapOnly {
		return nil, errors.New("can't subscribe to new messages on a bootstrap-only node")
	}

	sub := &NewMessageSubscription{
		messageCh: make(chan Message),
		doneCh:    make(chan struct{}, 1),
	}

	defer n.newMessageSubscriptionsLock.Unlock()
	n.newMessageSubscriptionsLock.Lock()
	n.newMessageSubscriptions = append(n.newMessageSubscriptions, sub)

	return sub, nil
}

func (n *node) JoinRoom(ctx context.Context, roomName string) error {
	if n.bootstrapOnly {
		return errors.New("can't join room on a bootstrap-only node")
	}

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

	n.currentRoomName = roomName

	return nil
}

func (n *node) CurrentRoomName() (string, error) {
	if n.bootstrapOnly {
		return "", errors.New("can't get current room name from a bootstrap-only node")
	}

	return n.currentRoomName, nil
}

func (n *node) SetNickname(ctx context.Context, nickname string) error {
	if n.bootstrapOnly {
		return errors.New("can't set nickname on a bootstrap-only node")
	}

	// TODO: should publish the nickname change to the rooms we are connected to
	// (https://github.com/FelipeRosa/go-libp2p-chat/issues/14)
	if len(n.kadDHT.RoutingTable().ListPeers()) == 0 {
		n.logger.Debug("postponing storing nickname in DHT: no peers connected")

		n.nicknameStoreMutex.Lock()
		defer n.nicknameStoreMutex.Unlock()
		if n.nicknameStoreWaiting {
			return nil
		}

		go func() {
			tick := time.Tick(time.Second)

		retryLoop:
			for {
				select {
				case <-tick:
					if len(n.kadDHT.RoutingTable().ListPeers()) == 0 {
						n.logger.Debug("postponing storing nickname in DHT: no peers connected")
						continue
					}

					// TODO: return error channel?
					if err := n.storeNickname(ctx, nickname); err != nil {
						n.logger.Error("failed storing nickname in DHT", zap.Error(err))
					}
					break retryLoop

				case <-ctx.Done():
					n.logger.Debug("stopping nickname store thread: context done")
					break retryLoop
				}
			}

			n.nicknameStoreMutex.Lock()
			defer n.nicknameStoreMutex.Unlock()
			n.nicknameStoreWaiting = false
		}()

		return nil
	}

	if err := n.storeNickname(ctx, nickname); err != nil {
		return err
	}
	return nil
}

func (n *node) GetNickname(ctx context.Context, peerID string) (string, error) {
	nickname, err := n.kadDHT.GetValue(ctx, fmt.Sprintf("chat/%s_nickname", peerID))
	if err != nil {
		return "", errors.Wrap(err, "getting peer nickname from DHT")
	}
	return string(nickname), nil
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

		// Overwrite the sender ID
		msg.SenderID = subMsg.GetFrom()
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

func (n *node) storeNickname(ctx context.Context, nickname string) error {
	n.logger.Debug("storing nickname in DHT")
	err := n.kadDHT.PutValue(ctx, fmt.Sprintf("chat/%s_nickname", n.ID()), []byte(nickname))
	if err != nil {
		return errors.Wrap(err, "storing nickname in DHT")
	}

	return nil
}

func (n *node) getPrivateKey() (crypto.PrivKey, error) {
	if !n.storeIdentity {
		return n.generateNewPrivKey()
	}

	var generate bool

	privKeyBytes, err := ioutil.ReadFile("privkey_rsa")
	if os.IsNotExist(err) {
		n.logger.Info("no identity private key file found.")
		generate = true
	} else if err != nil {
		return nil, err
	}

	if generate {
		privKey, err := n.generateNewPrivKey()
		if err != nil {
			return nil, err
		}

		privKeyBytes, err := crypto.MarshalPrivateKey(privKey)
		if err != nil {
			return nil, errors.Wrap(err, "marshalling identity private key")
		}

		f, err := os.Create("privkey_rsa")
		if err != nil {
			return nil, errors.Wrap(err, "creating identity private key file")
		}
		defer f.Close()

		if _, err := f.Write(privKeyBytes); err != nil {
			return nil, errors.Wrap(err, "writing identity private key to file")
		}

		return privKey, nil
	}

	privKey, err := crypto.UnmarshalPrivateKey(privKeyBytes)
	if err != nil {
		return nil, errors.Wrap(err, "unmarshalling identity private key")
	}

	n.logger.Info("loaded identity private key from file")
	return privKey, nil
}

func (n *node) generateNewPrivKey() (crypto.PrivKey, error) {
	n.logger.Info("generating identity private key")
	privKey, _, err := crypto.GenerateKeyPair(crypto.RSA, 4096)
	if err != nil {
		return nil, errors.Wrap(err, "generating identity private key")
	}
	n.logger.Info("generated new identity private key")

	return privKey, nil
}
