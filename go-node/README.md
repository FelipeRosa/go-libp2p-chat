# libp2p-chat Go Node

## Running a standalone node

### Bootstrap node

A standalone bootstrap node can be started with:

```shell
go run main.go -port PORT -bootstrap-only
```

### Client nodes

You can join the network by connecting to bootstrap nodes with:

```shell
go run main.go -port PORT -bootstrap.addrs BOOTSTRAP_NODE_ADDRS
```