# libp2p Chat

Peer-to-peer chat node built using libp2p as a learning project.

## Usage

Start some bootstrap node(s)

```shell
go run main.go -p PORT1
```

Start some node(s) which communicate with bootstrap nodes to initially find some peers:

```shell
go run main.go -p PORT2 -a BOOTSTRAP_NODE_ADDR
```