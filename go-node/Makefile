build:
	@go build -o chat-gonode cmd/node/main.go

gen: clean
	@protoc --go_out=. --go-grpc_out=. proto/api.proto

clean:
	@rm -f chat-gonode
