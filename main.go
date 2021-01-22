package main

import (
	"context"
	"flag"
	"fmt"
	"libp2pchat/chat"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/multiformats/go-multiaddr"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

type cfg struct {
	NodePort       uint16
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

	go func() {
		var counter int
		ticker := time.Tick(time.Second)

		for {
			<-ticker

			logger.Info("sending message")
			if err := node.SendMessage(ctx, strconv.Itoa(counter)); err != nil {
				logger.Error("failed sending message", zap.Error(err))
			}

			counter++
		}
	}()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGKILL, syscall.SIGTERM)

	sub := node.SubscribeToNewMessages()

	for {
		select {
		case <-sigChan:
			return

		case msg := <-sub.Channel():
			logger.Info("new message",
				zap.String("senderID", msg.SenderID.Pretty()),
				zap.Time("timestamp", msg.Timestamp),
				zap.String("value", msg.Value),
			)
		}
	}
}

func parseArgs() (cfg, error) {
	nodePort := flag.Uint("p", 0, "node port")
	bootstrapNodes := flag.String("a", "", "comma separated list of bootstrap node addresses")
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
		BootstrapNodes: bootstrapNodeAddrs,
	}, nil
}
