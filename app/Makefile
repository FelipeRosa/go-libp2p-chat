PROTOC_GEN_TS_PATH="./node_modules/.bin/protoc-gen-ts"
PROTOC_GEN_GRPC_PATH="./node_modules/.bin/grpc_tools_node_protoc_plugin"

.PHONY:

all-linux-x64: installer-linux-rpm-x64 installer-linux-deb-x64 installer-linux-zip-x64

installer-linux-deb-x64: package-linux-x64
	yarn electron-installer-debian \
 		--src dist/libp2p-chat-linux-x64/ \
	 	--dest dist/installers/ \
	 	--arch amd64

installer-linux-rpm-x64: package-linux-x64
	yarn electron-installer-redhat \
 		--src dist/libp2p-chat-linux-x64/ \
 		--dest dist/installers/ \
 		--arch x86_64

installer-linux-zip-x64: package-linux-x64
	bash scripts/zip-dist-linux.sh

package-linux-x64: build
	yarn electron-packager . \
		--ignore "(node_modules|.idea)" \
		--platform linux \
		--arch x64 \
		--out dist

package-darwin-x64: build
	yarn electron-packager . \
		--ignore "(node_modules|.idea)" \
		--platform darwin \
		--arch x64 \
		--out dist
	echo "Generating .dmg file"
	node scripts/dmg-darwin.js
	echo "Done"

build: go-node
	yarn build
	cp chat-gonode build

gen: .PHONY
	rm -rf gen
	mkdir gen
	protoc \
	--plugin="protoc-gen-ts"=${PROTOC_GEN_TS_PATH} \
	--plugin="protoc-gen-grpc"=${PROTOC_GEN_GRPC_PATH} \
	-I ../go-node/proto \
	--js_out=import_style=commonjs,binary:gen \
	--ts_out=service=grpc-node,mode=grpc-js:gen \
	--grpc_out=grpc_js:gen \
	../go-node/proto/api.proto

go-node:
	cd ../go-node && make build
	cp ../go-node/chat-gonode .

clean:
	rm -rf dist
	rm -rf build
	rm -rf chat-gonode