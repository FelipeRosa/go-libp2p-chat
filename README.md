# libp2p Chat

Peer-to-peer chat node built using libp2p as a learning project.

![Application usage gif](docs/readme-gif.gif)

## Running a standalone node

### Bootstrap node

A standalone bootstrap node can be started with:

```shell
go run main.go -port PORT -api-port APIPORT
```

### Client nodes

You can join the network by connecting to bootstrap nodes with:
 
```shell
go run main.go -port PORT -api-port APIPORT -bootstrap-addrs BOOTSTRAP_NODE_ADDRS
```

## License

This project is licensed under the [MIT License]

[MIT License]: https://github.com/FelipeRosa/go-libp2p-chat/blob/main/LICENSE