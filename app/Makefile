PROTOC_GEN_TS_PATH="./node_modules/.bin/protoc-gen-ts"
PROTOC_GEN_GRPC_PATH="./node_modules/.bin/grpc_tools_node_protoc_plugin"

gen: clean
	@mkdir -p gen
	@protoc \
	--plugin="protoc-gen-ts"=${PROTOC_GEN_TS_PATH} \
	--plugin="protoc-gen-grpc"=${PROTOC_GEN_GRPC_PATH} \
	-I ../go-node/proto \
	--js_out=import_style=commonjs,binary:gen \
	--ts_out=service=grpc-node,mode=grpc-js:gen \
	--grpc_out=grpc_js:gen \
	../go-node/proto/api.proto

go-node:
	@cd ../go-node && make build
	@cp ../go-node/chat-gonode .

clean:
	@rm -rf dist
	@rm -rf gen