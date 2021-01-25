for x in dist/libp2p-chat-linux*; do
  zip -r "$x.zip" "$x"
done
