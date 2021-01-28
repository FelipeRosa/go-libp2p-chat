.PHONY:

build-all: build build-nodetool

build-nodetool:
	go build -o chat-nodetool cmd/nodetool/main.go

build:
	go build -o chat-gonode cmd/node/main.go

gen: .PHONY
	rm -rf gen
	mkdir gen
	protoc --go_out=. --go-grpc_out=. proto/api.proto

clean:
	rm -f chat-gonode chat-nodetool
