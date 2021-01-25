// Code generated by protoc-gen-go-grpc. DO NOT EDIT.

package api

import (
	context "context"
	grpc "google.golang.org/grpc"
	codes "google.golang.org/grpc/codes"
	status "google.golang.org/grpc/status"
)

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
// Requires gRPC-Go v1.32.0 or later.
const _ = grpc.SupportPackageIsVersion7

// ApiClient is the client API for Api service.
//
// For semantics around ctx use and closing/ending streaming RPCs, please refer to https://pkg.go.dev/google.golang.org/grpc/?tab=doc#ClientConn.NewStream.
type ApiClient interface {
	Ping(ctx context.Context, in *PingRequest, opts ...grpc.CallOption) (*PingResponse, error)
	SendMessage(ctx context.Context, in *ChatMessage, opts ...grpc.CallOption) (*SendMessageResponse, error)
	SubscribeToNewMessages(ctx context.Context, in *SubscribeToNewMessagesRequest, opts ...grpc.CallOption) (Api_SubscribeToNewMessagesClient, error)
	GetNodeID(ctx context.Context, in *GetNodeIDRequest, opts ...grpc.CallOption) (*GetNodeIDResponse, error)
}

type apiClient struct {
	cc grpc.ClientConnInterface
}

func NewApiClient(cc grpc.ClientConnInterface) ApiClient {
	return &apiClient{cc}
}

func (c *apiClient) Ping(ctx context.Context, in *PingRequest, opts ...grpc.CallOption) (*PingResponse, error) {
	out := new(PingResponse)
	err := c.cc.Invoke(ctx, "/api.Api/Ping", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *apiClient) SendMessage(ctx context.Context, in *ChatMessage, opts ...grpc.CallOption) (*SendMessageResponse, error) {
	out := new(SendMessageResponse)
	err := c.cc.Invoke(ctx, "/api.Api/SendMessage", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *apiClient) SubscribeToNewMessages(ctx context.Context, in *SubscribeToNewMessagesRequest, opts ...grpc.CallOption) (Api_SubscribeToNewMessagesClient, error) {
	stream, err := c.cc.NewStream(ctx, &Api_ServiceDesc.Streams[0], "/api.Api/SubscribeToNewMessages", opts...)
	if err != nil {
		return nil, err
	}
	x := &apiSubscribeToNewMessagesClient{stream}
	if err := x.ClientStream.SendMsg(in); err != nil {
		return nil, err
	}
	if err := x.ClientStream.CloseSend(); err != nil {
		return nil, err
	}
	return x, nil
}

type Api_SubscribeToNewMessagesClient interface {
	Recv() (*ChatMessageWithTimestamp, error)
	grpc.ClientStream
}

type apiSubscribeToNewMessagesClient struct {
	grpc.ClientStream
}

func (x *apiSubscribeToNewMessagesClient) Recv() (*ChatMessageWithTimestamp, error) {
	m := new(ChatMessageWithTimestamp)
	if err := x.ClientStream.RecvMsg(m); err != nil {
		return nil, err
	}
	return m, nil
}

func (c *apiClient) GetNodeID(ctx context.Context, in *GetNodeIDRequest, opts ...grpc.CallOption) (*GetNodeIDResponse, error) {
	out := new(GetNodeIDResponse)
	err := c.cc.Invoke(ctx, "/api.Api/GetNodeID", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// ApiServer is the server API for Api service.
// All implementations must embed UnimplementedApiServer
// for forward compatibility
type ApiServer interface {
	Ping(context.Context, *PingRequest) (*PingResponse, error)
	SendMessage(context.Context, *ChatMessage) (*SendMessageResponse, error)
	SubscribeToNewMessages(*SubscribeToNewMessagesRequest, Api_SubscribeToNewMessagesServer) error
	GetNodeID(context.Context, *GetNodeIDRequest) (*GetNodeIDResponse, error)
	mustEmbedUnimplementedApiServer()
}

// UnimplementedApiServer must be embedded to have forward compatible implementations.
type UnimplementedApiServer struct {
}

func (UnimplementedApiServer) Ping(context.Context, *PingRequest) (*PingResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method Ping not implemented")
}
func (UnimplementedApiServer) SendMessage(context.Context, *ChatMessage) (*SendMessageResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method SendMessage not implemented")
}
func (UnimplementedApiServer) SubscribeToNewMessages(*SubscribeToNewMessagesRequest, Api_SubscribeToNewMessagesServer) error {
	return status.Errorf(codes.Unimplemented, "method SubscribeToNewMessages not implemented")
}
func (UnimplementedApiServer) GetNodeID(context.Context, *GetNodeIDRequest) (*GetNodeIDResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method GetNodeID not implemented")
}
func (UnimplementedApiServer) mustEmbedUnimplementedApiServer() {}

// UnsafeApiServer may be embedded to opt out of forward compatibility for this service.
// Use of this interface is not recommended, as added methods to ApiServer will
// result in compilation errors.
type UnsafeApiServer interface {
	mustEmbedUnimplementedApiServer()
}

func RegisterApiServer(s grpc.ServiceRegistrar, srv ApiServer) {
	s.RegisterService(&Api_ServiceDesc, srv)
}

func _Api_Ping_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(PingRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(ApiServer).Ping(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/api.Api/Ping",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(ApiServer).Ping(ctx, req.(*PingRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _Api_SendMessage_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(ChatMessage)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(ApiServer).SendMessage(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/api.Api/SendMessage",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(ApiServer).SendMessage(ctx, req.(*ChatMessage))
	}
	return interceptor(ctx, in, info, handler)
}

func _Api_SubscribeToNewMessages_Handler(srv interface{}, stream grpc.ServerStream) error {
	m := new(SubscribeToNewMessagesRequest)
	if err := stream.RecvMsg(m); err != nil {
		return err
	}
	return srv.(ApiServer).SubscribeToNewMessages(m, &apiSubscribeToNewMessagesServer{stream})
}

type Api_SubscribeToNewMessagesServer interface {
	Send(*ChatMessageWithTimestamp) error
	grpc.ServerStream
}

type apiSubscribeToNewMessagesServer struct {
	grpc.ServerStream
}

func (x *apiSubscribeToNewMessagesServer) Send(m *ChatMessageWithTimestamp) error {
	return x.ServerStream.SendMsg(m)
}

func _Api_GetNodeID_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(GetNodeIDRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(ApiServer).GetNodeID(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/api.Api/GetNodeID",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(ApiServer).GetNodeID(ctx, req.(*GetNodeIDRequest))
	}
	return interceptor(ctx, in, info, handler)
}

// Api_ServiceDesc is the grpc.ServiceDesc for Api service.
// It's only intended for direct use with grpc.RegisterService,
// and not to be introspected or modified (even as a copy)
var Api_ServiceDesc = grpc.ServiceDesc{
	ServiceName: "api.Api",
	HandlerType: (*ApiServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "Ping",
			Handler:    _Api_Ping_Handler,
		},
		{
			MethodName: "SendMessage",
			Handler:    _Api_SendMessage_Handler,
		},
		{
			MethodName: "GetNodeID",
			Handler:    _Api_GetNodeID_Handler,
		},
	},
	Streams: []grpc.StreamDesc{
		{
			StreamName:    "SubscribeToNewMessages",
			Handler:       _Api_SubscribeToNewMessages_Handler,
			ServerStreams: true,
		},
	},
	Metadata: "proto/api.proto",
}
