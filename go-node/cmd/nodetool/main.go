package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"os"

	apigen "github.com/FelipeRosa/go-libp2p-chat/go-node/gen/api"
	"google.golang.org/grpc"
)

type command interface {
	Run(ctx context.Context, client apigen.ApiClient) (interface{}, error)
}

type pingCmd struct{}

func (*pingCmd) Run(ctx context.Context, client apigen.ApiClient) (interface{}, error) {
	return client.Ping(ctx, &apigen.PingRequest{})
}

type nodeIDCmd struct{}

func (*nodeIDCmd) Run(ctx context.Context, client apigen.ApiClient) (interface{}, error) {
	return client.GetNodeID(ctx, &apigen.GetNodeIDRequest{})
}

type getNicknameCmd struct {
	PeerID string
}

func (cmd *getNicknameCmd) Run(ctx context.Context, client apigen.ApiClient) (interface{}, error) {
	return client.GetNickname(ctx, &apigen.GetNicknameRequest{PeerId: cmd.PeerID})
}

func main() {
	addr := flag.String("a", "", "node API address")
	port := flag.Uint("p", 0, "node API port")
	flag.Parse()

	if *addr == "" {
		flag.Usage()
		os.Exit(1)
	}
	if *port == 0 {
		flag.Usage()
		os.Exit(1)
	}

	cmds := "ping, node-id, get-nickname"

	args := flag.Args()
	if len(args) == 0 {
		fmt.Fprintf(os.Stderr, "missing subcommand: %s\n", cmds)
		os.Exit(1)
	}

	// pop command string
	cmdString := args[0]
	args = args[1:]

	var cmd command
	switch cmdString {
	case "ping":
		fs := flag.NewFlagSet("ping", flag.ExitOnError)
		fs.Parse(args)
		assertNoUnwantedArgs(fs.Args())

		cmd = &pingCmd{}

	case "node-id":
		fs := flag.NewFlagSet("node-id", flag.ExitOnError)
		fs.Parse(args)
		assertNoUnwantedArgs(fs.Args())

		cmd = &nodeIDCmd{}

	case "get-nickname":
		fs := flag.NewFlagSet("get-nickname", flag.ExitOnError)
		peerID := fs.String("peer-id", "", "peer ID")
		fs.Parse(args)
		assertNoUnwantedArgs(fs.Args())

		if *peerID == "" {
			fmt.Fprintln(os.Stderr, "peer ID is missing")
			os.Exit(1)
		}

		cmd = &getNicknameCmd{PeerID: *peerID}

	default:
		fmt.Fprintf(os.Stderr, "unknown command %s. expecting one of: %s\n", cmdString, cmds)
		os.Exit(1)
	}

	ctx := context.Background()

	clientConn, err := grpc.DialContext(ctx, fmt.Sprintf("%s:%d", *addr, *port), grpc.WithInsecure())
	if err != nil {
		panic(err)
	}

	client := apigen.NewApiClient(clientConn)

	res, err := cmd.Run(ctx, client)
	if err != nil {
		panic(err)
	}

	resJSON, err := json.Marshal(res)
	if err != nil {
		panic(err)
	}

	fmt.Println(string(resJSON))
}

func assertNoUnwantedArgs(args []string) {
	if len(args) == 0 {
		return
	}

	fmt.Fprintf(os.Stderr, "unknown argument %s\n", args[0])
	os.Exit(1)
}
