package node

import (
	"context"
	"crypto/rand"
	"fmt"
	"io/ioutil"
	"os"
	"sync"
	"time"

	"github.com/FelipeRosa/go-libp2p-chat/go-node/entities"
	"github.com/FelipeRosa/go-libp2p-chat/go-node/events"
	"github.com/libp2p/go-libp2p"
	"github.com/libp2p/go-libp2p-core/crypto"
	discovery2 "github.com/libp2p/go-libp2p-core/discovery"
	libp2phost "github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/peer"
	discovery "github.com/libp2p/go-libp2p-discovery"
	"github.com/libp2p/go-libp2p-kad-dht"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	"github.com/multiformats/go-multiaddr"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

const privKeyFileName = "libp2p-chat.privkey"

type Node interface {
	ID() peer.ID

	Start(ctx context.Context, port uint16) error
	Bootstrap(ctx context.Context, nodeAddrs []multiaddr.Multiaddr) error

	SendMessage(ctx context.Context, roomName string, msg string) error

	JoinRoom(roomName string) error

	SetNickname(roomName string, nickname string) error
	GetNickname(ctx context.Context, roomName string, peerID peer.ID) (string, error)

	SubscribeToEvents() (events.Subscriber, error)

	Shutdown() error
}

type node struct {
	logger *zap.Logger
	host   libp2phost.Host
	kadDHT *dht.IpfsDHT

	bootstrapOnly bool

	storeIdentity bool

	ps          *pubsub.PubSub
	roomManager *RoomManager

	eventPublishers     []events.Publisher
	eventPublishersLock sync.RWMutex

	nicknameStoreMutex   sync.Mutex
	nicknameStoreWaiting bool
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
	}
}

func (n *node) ID() peer.ID {
	if n.host == nil {
		return ""
	}
	return n.host.ID()
}

func (n *node) Start(ctx context.Context, port uint16) error {
	n.logger.Info("starting node", zap.Bool("bootstrapOnly", n.bootstrapOnly))

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

	n.logger.Info("started node", zap.Strings("p2pAddresses", fullAddrs))
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
		dht.ProtocolPrefix("/"+DiscoveryNamespace),
		dht.Mode(dht.ModeAutoServer),
		dht.NamespacedValidator(RoomInfoNamespace, &roomDataValidator{}),
	)
	if err != nil {
		return errors.Wrap(err, "creating routing DHT")
	}

	n.kadDHT = kadDHT

	if err := kadDHT.Bootstrap(ctx); err != nil {
		return errors.Wrap(err, "bootstrapping DHT")
	}

	// Setup room manager
	roomManager, roomManagerEvtSub := NewRoomManager(n.logger, n, n.kadDHT, n.ps)
	n.roomManager = roomManager
	go n.joinRoomManagerEvents(roomManagerEvtSub)

	// We can return at this point, since we have no other nodes to advertise too.
	// Is this right?
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
	discovery.Advertise(ctx, rd, DiscoveryNamespace)

	// try finding more peers
	go func() {
		for {
			n.logger.Info("looking for peers...")

			peersChan, err := rd.FindPeers(
				ctx,
				DiscoveryNamespace,
				discovery2.Limit(100),
			)
			if err != nil {
				n.logger.Error("failed trying to find peers", zap.Error(err))
				continue
			}

			// read all channel messages to avoid blocking the find peer query
			for range peersChan {
			}

			n.logger.Info("done looking for peers",
				zap.Int("peerCount", n.host.Peerstore().Peers().Len()),
			)

			<-time.After(time.Minute)
		}
	}()

	return nil
}

func (n *node) SendMessage(ctx context.Context, roomName string, msg string) error {
	if n.bootstrapOnly {
		return errors.New("can't send message from a bootstrap-only node")
	}

	m := entities.Message{
		SenderID:  n.host.ID(),
		Timestamp: time.Now(),
		Value:     msg,
	}

	if err := n.roomManager.SendChatMessage(ctx, roomName, m); err != nil {
		return errors.Wrap(err, "publishing message")
	}

	return nil
}

func (n *node) JoinRoom(roomName string) error {
	if n.bootstrapOnly {
		return errors.New("can't join room on a bootstrap-only node")
	}

	if _, err := n.roomManager.JoinAndSubscribe(roomName); err != nil {
		return err
	}
	return nil
}

func (n *node) SetNickname(roomName string, nickname string) error {
	if n.bootstrapOnly {
		return errors.New("can't set nickname on a bootstrap-only node")
	}

	if err := n.roomManager.SetNickname(roomName, nickname); err != nil {
		return err
	}
	return nil
}

func (n *node) GetNickname(
	ctx context.Context,
	roomName string,
	peerID peer.ID,
) (string, error) {
	return n.roomManager.GetNickname(ctx, roomName, peerID)
}

func (n *node) SubscribeToEvents() (events.Subscriber, error) {
	if n.bootstrapOnly {
		return nil, errors.New("can't subscribe to events on a bootstrap-only node")
	}

	pub, sub := events.NewSubscription()

	n.eventPublishersLock.Lock()
	defer n.eventPublishersLock.Unlock()
	n.eventPublishers = append(n.eventPublishers, pub)

	return sub, nil
}

func (n *node) Shutdown() error {
	return n.host.Close()
}

func (n *node) publishEvent(evt events.Event) {
	n.eventPublishersLock.RLock()
	defer n.eventPublishersLock.RUnlock()

	for _, pub := range n.eventPublishers {
		if err := pub.Publish(evt); err != nil {
			n.logger.Error("failed publishing node event", zap.Error(err))
		}
	}
}

func (n *node) getPrivateKey() (crypto.PrivKey, error) {
	if !n.storeIdentity {
		return n.generateNewPrivKey()
	}

	var generate bool

	privKeyBytes, err := ioutil.ReadFile(privKeyFileName)
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

		f, err := os.Create(privKeyFileName)
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
	privKey, _, err := crypto.GenerateEd25519Key(rand.Reader)
	if err != nil {
		return nil, errors.Wrap(err, "generating identity private key")
	}
	n.logger.Info("generated new identity private key")

	return privKey, nil
}

func (n *node) joinRoomManagerEvents(sub events.Subscriber) {
	for {
		evt, err := sub.Next()
		if err != nil {
			n.logger.Error("failed receiving room manager event", zap.Error(err))
		}

		n.publishEvent(evt)
	}
}
