PHONY:

gen: clean
	@protoc --go_out=. --go-grpc_out=. proto/api.proto

clean:
	@rm -rf gen