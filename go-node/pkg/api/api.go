package api

import (
	"context"

	apigen "github.com/FelipeRosa/go-libp2p-chat/go-node/pkg/gen/api"
	"github.com/FelipeRosa/go-libp2p-chat/go-node/pkg/node"

	"go.uber.org/zap"
)

type Server struct {
	apigen.UnimplementedApiServer

	logger *zap.Logger
	node   node.Node
}

func NewServer(logger *zap.Logger, node node.Node) *Server {
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
	s.logger.Info("handling GetNickname")

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
	s.logger.Info("handling GetCurrentRoomName")

	roomName, err := s.node.CurrentRoomName()
	if err != nil {
		return nil, err
	}

	return &apigen.GetCurrentRoomNameResponse{RoomName: roomName}, nil
}

func (s *Server) SubscribeToEvents(
	_ *apigen.SubscribeToEventsRequest,
	stream apigen.Api_SubscribeToEventsServer,
) error {
	s.logger.Info("handling SubscribeToEvents")

	sub, err := s.node.SubscribeToEvents()
	if err != nil {
		return err
	}
	defer sub.Close()

	for {
		evt, err := sub.Next()
		if err != nil {
			return err
		}

		if err := stream.Send(evt.MarshalToProtobuf()); err != nil {
			return err
		}
	}
}
