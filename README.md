# libp2p Chat

Peer-to-peer chat app built using libp2p as a learning project.

![Application usage gif](docs/readme-gif.gif)

## Connecting to the test network

Connect to this project's bootstrap node at (can take a bit to connect):

```
/ip4/35.231.130.111/tcp/3000/p2p/QmULcHu2zsmaZ6McdLhyQKjhxLEbxYjrVV8Td347j77F2b
```

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

## License

This project is licensed under the [MIT License]

[MIT License]: https://github.com/FelipeRosa/go-libp2p-chat/blob/main/LICENSE
