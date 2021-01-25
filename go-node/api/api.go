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

func (s *Server) Ping(context.Context, *apigen.PingRequest) (*apigen.PingResponse, error) {
	s.logger.Info("handling Ping")

	return &apigen.PingResponse{}, nil
}

func (s *Server) SendMessage(ctx context.Context, msg *apigen.SendMessageRequest) (*apigen.SendMessageResponse, error) {
	s.logger.Info("handling SendMessage")

	if err := s.node.SendMessage(ctx, msg.Value); err != nil {
		return nil, err
	}

	return &apigen.SendMessageResponse{Sent: true}, nil
}

func (s *Server) SubscribeToNewMessages(_ *apigen.SubscribeToNewMessagesRequest, stream apigen.Api_SubscribeToNewMessagesServer) error {
	s.logger.Info("handling SubscribeToNewMessages")

	sub := s.node.SubscribeToNewMessages()
	defer sub.Close()

	for {
		msg := <-sub.Channel()

		err := stream.Send(&apigen.ChatMessage{
			SenderId:  msg.SenderID.Pretty(),
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

func (s *Server) GetNodeID(context.Context, *apigen.GetNodeIDRequest) (*apigen.GetNodeIDResponse, error) {
	s.logger.Info("handling GetNodeID")

	return &apigen.GetNodeIDResponse{Id: s.node.ID()}, nil
}

func (s *Server) SetNickname(_ context.Context, request *apigen.SetNicknameRequest) (*apigen.SetNicknameResponse, error) {
	s.logger.Info("handling SetNickname")

	// let it run forever passing context.Background()
	if err := s.node.SetNickname(context.Background(), request.Nickname); err != nil {
		s.logger.Error("failed setting nickname", zap.Error(err))
		return nil, err
	}

	return &apigen.SetNicknameResponse{}, nil
}

func (s *Server) GetNickname(
	ctx context.Context,
	request *apigen.GetNicknameRequest,
) (*apigen.GetNicknameResponse, error) {
	nickname, err := s.node.GetNickname(ctx, request.PeerId)
	if err != nil {
		s.logger.Error("failed getting peer nickname", zap.Error(err))
		return nil, err
	}

	return &apigen.GetNicknameResponse{Nickname: nickname}, nil
}

func (s *Server) GetCurrentRoomName(
	context.Context,
	*apigen.GetCurrentRoomNameRequest,
) (*apigen.GetCurrentRoomNameResponse, error) {
	return &apigen.GetCurrentRoomNameResponse{RoomName: s.node.CurrentRoomName()}, nil
}
