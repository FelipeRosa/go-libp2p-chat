package main

import (
	"context"
	"flag"
	"fmt"
	"net"
	"os"
	"os/signal"
	"strings"
	"syscall"

	"github.com/FelipeRosa/go-libp2p-chat/go-node/api"
	apigen "github.com/FelipeRosa/go-libp2p-chat/go-node/gen/api"
	"github.com/FelipeRosa/go-libp2p-chat/go-node/node"

	"github.com/multiformats/go-multiaddr"
	"github.com/pkg/errors"
	"go.uber.org/zap"
	"google.golang.org/grpc"
)

type cfg struct {
	NodePort       uint16
	APIPort        uint16
	APILocal       bool
	BootstrapOnly  bool
	BootstrapNodes []multiaddr.Multiaddr
	StoreIdentity  bool
}

func main() {
	cfg, err := parseArgs()
	if err != nil {
		panic(err)
	}

	ctx := context.Background()

	logger, err := zap.NewDevelopment()
	if err != nil {
		panic(err)
	}

	n := node.NewNode(logger, cfg.BootstrapOnly, cfg.StoreIdentity)
	if err := n.Start(ctx, cfg.NodePort); err != nil {
		panic(err)
	}
	defer func() {
		logger.Info("shutting down...")
		// handle shutdown error
		if err := n.Shutdown(); err != nil {
			panic(err)
		}
	}()

	if err := n.Bootstrap(ctx, cfg.BootstrapNodes); err != nil {
		logger.Error("failed bootstrapping", zap.Error(err))
		return
	}

	// skip joining the global room if this node is a bootstrap-only node since its purpose is just to join
	// other nodes into the network
	if !cfg.BootstrapOnly {
		if err := n.JoinRoom("global"); err != nil {
			logger.Error("failed joining global room")
			return
		}
	}

	if cfg.APIPort != 0 {
		var apiListenerAddr string
		if cfg.APILocal {
			apiListenerAddr = fmt.Sprintf("127.0.0.1")
		} else {
			apiListenerAddr = fmt.Sprintf("0.0.0.0")
		}
		apiListenerAddr = fmt.Sprintf("%s:%d", apiListenerAddr, cfg.APIPort)

		logger.Info("starting gRPC API server",
			zap.String("address", apiListenerAddr),
			zap.Bool("local", cfg.APILocal),
		)
		apiListener, err := net.Listen("tcp", apiListenerAddr)
		if err != nil {
			logger.Error("failed starting gRPC API server", zap.Error(err))
			return
		}

		grpcServer := grpc.NewServer()
		apigen.RegisterApiServer(grpcServer, api.NewServer(logger, n))

		go func() {
			if err := grpcServer.Serve(apiListener); err != nil {
				logger.Error("failed starting to serve gRPC requests", zap.Error(err))
				// TODO: signal this error to the main thread through a channel
				//		 otherwise we will end up with a running node and an offline API.
			}
		}()
	}

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGKILL, syscall.SIGTERM)
	<-sigChan
}

func parseArgs() (cfg, error) {
	nodePort := flag.Uint("port", 0, "node port")
	bootstrapOnly := flag.Bool("bootstrap-only", false, "whether the node should only serve as a bootstrap node (e.g. it will not respond to send message requests)")
	apiPort := flag.Uint("api.port", 0, "api port")
	apiLocal := flag.Bool("api.local", true, "whether the node API should be accessible only from localhost")
	bootstrapNodes := flag.String("bootstrap.addrs", "", "comma separated list of bootstrap node addresses")
	storeIdentity := flag.Bool("id.store", false, "whether the identity private key should be stored to a file")
	flag.Parse()

	if *nodePort == 0 {
		return cfg{}, errors.New("node port is required")
	}

	var bootstrapNodeAddrs []multiaddr.Multiaddr
	if *bootstrapNodes != "" {
		for _, b := range strings.Split(*bootstrapNodes, ",") {
			addr, err := multiaddr.NewMultiaddr(b)
			if err != nil {
				return cfg{}, errors.Wrap(err, "parsing bootstrap node addresses")
			}

			bootstrapNodeAddrs = append(bootstrapNodeAddrs, addr)
		}
	}

	return cfg{
		NodePort:       uint16(*nodePort),
		APILocal:       *apiLocal,
		APIPort:        uint16(*apiPort),
		BootstrapOnly:  *bootstrapOnly,
		BootstrapNodes: bootstrapNodeAddrs,
		StoreIdentity:  *storeIdentity,
	}, nil
}
