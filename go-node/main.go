package main

import (
	"context"
	"flag"
	"fmt"
	"libp2pchat/api"
	"libp2pchat/chat"
	apigen "libp2pchat/gen/api"
	"net"
	"os"
	"os/signal"
	"strings"
	"syscall"

	"github.com/multiformats/go-multiaddr"
	"github.com/pkg/errors"
	"go.uber.org/zap"
	"google.golang.org/grpc"
)

type cfg struct {
	NodePort       uint16
	APIPort        uint16
	BootstrapNodes []multiaddr.Multiaddr
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

	node := chat.NewNode(logger)
	if err := node.Start(ctx, cfg.NodePort); err != nil {
		panic(err)
	}
	defer func() {
		logger.Info("shutting down...")
		// handle shutdown error
		if err := node.Shutdown(); err != nil {
			panic(err)
		}
	}()

	if err := node.Bootstrap(ctx, cfg.BootstrapNodes); err != nil {
		logger.Error("failed bootstrapping", zap.Error(err))
		return
	}
	if err := node.JoinRoom(ctx, "global"); err != nil {
		logger.Error("failed joining global room")
		return
	}

	if cfg.APIPort != 0 {
		logger.Info("starting gRPC API server")
		apiListener, err := net.Listen("tcp", fmt.Sprintf("localhost:%d", cfg.APIPort))
		if err != nil {
			logger.Error("failed starting gRPC API server", zap.Error(err))
			return
		}

		grpcServer := grpc.NewServer()
		apigen.RegisterApiServer(grpcServer, api.NewServer(logger, node))

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
	apiPort := flag.Uint("api-port", 0, "api port")
	bootstrapNodes := flag.String("bootstrap-addrs", "", "comma separated list of bootstrap node addresses")
	flag.Parse()

	if *nodePort == 0 {
		return cfg{}, errors.New("node port is required")
	}

	var bootstrapNodeAddrs []multiaddr.Multiaddr
	if *bootstrapNodes != "" {
		for _, b := range strings.Split(*bootstrapNodes, ",") {
			fmt.Println(b)
			addr, err := multiaddr.NewMultiaddr(b)
			if err != nil {
				return cfg{}, errors.Wrap(err, "parsing bootstrap node addresses")
			}

			bootstrapNodeAddrs = append(bootstrapNodeAddrs, addr)
		}
	}

	return cfg{
		NodePort:       uint16(*nodePort),
		APIPort:        uint16(*apiPort),
		BootstrapNodes: bootstrapNodeAddrs,
	}, nil
}
