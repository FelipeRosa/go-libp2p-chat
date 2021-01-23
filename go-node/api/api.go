package api

import (
	"context"
	"github.com/FelipeRosa/go-libp2p-chat/go-node/chat"
	apigen "github.com/FelipeRosa/go-libp2p-chat/go-node/gen/api"

	"go.uber.org/zap"
)

type Server struct {
	apigen.UnimplementedApiServer

	logger *zap.Logger
	node   chat.Node
}

func NewServer(logger *zap.Logger, node chat.Node) *Server {
	return &Server{
		logger: logger,
		node:   node,
	}
}

func (s *Server) Ping(ctx context.Context, request *apigen.PingRequest) (*apigen.PingResponse, error) {
	s.logger.Info("handling Ping")

	return &apigen.PingResponse{
		Ok: true,
	}, nil
}

func (s *Server) SendMessage(ctx context.Context, msg *apigen.ChatMessage) (*apigen.SendMessageResponse, error) {
	s.logger.Info("handling SendMessage")

	if err := s.node.SendMessage(ctx, msg.Value); err != nil {
		return nil, err
	}

	return &apigen.SendMessageResponse{Sent: true}, nil
}

func (s *Server) SubscribeToNewMessages(request *apigen.SubscribeToNewMessagesRequest, stream apigen.Api_SubscribeToNewMessagesServer) error {
	s.logger.Info("handling SubscribeToNewMessages")

	sub := s.node.SubscribeToNewMessages()
	defer sub.Close()

	for {
		msg := <-sub.Channel()

		err := stream.Send(&apigen.ChatMessageWithTimestamp{
			SenderID:  msg.SenderID.Pretty(),
			Timestamp: msg.Timestamp.Unix(),
			Value:     msg.Value,
		})
		if err != nil {
			s.logger.Debug("closing stream: failed sending chat message", zap.Error(err))
			break
		}
	}

	return nil
}
