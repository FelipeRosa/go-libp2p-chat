// GENERATED CODE -- DO NOT EDIT!

// package: api
// file: api.proto

import * as api_pb from "./api_pb";
import * as grpc from "@grpc/grpc-js";

interface IApiService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  ping: grpc.MethodDefinition<api_pb.PingRequest, api_pb.PingResponse>;
  sendMessage: grpc.MethodDefinition<api_pb.ChatMessage, api_pb.SendMessageResponse>;
  subscribeToNewMessages: grpc.MethodDefinition<api_pb.SubscribeToNewMessagesRequest, api_pb.ChatMessageWithTimestamp>;
  getNodeID: grpc.MethodDefinition<api_pb.GetNodeIDRequest, api_pb.GetNodeIDResponse>;
}

export const ApiService: IApiService;

export interface IApiServer extends grpc.UntypedServiceImplementation {
  ping: grpc.handleUnaryCall<api_pb.PingRequest, api_pb.PingResponse>;
  sendMessage: grpc.handleUnaryCall<api_pb.ChatMessage, api_pb.SendMessageResponse>;
  subscribeToNewMessages: grpc.handleServerStreamingCall<api_pb.SubscribeToNewMessagesRequest, api_pb.ChatMessageWithTimestamp>;
  getNodeID: grpc.handleUnaryCall<api_pb.GetNodeIDRequest, api_pb.GetNodeIDResponse>;
}

export class ApiClient extends grpc.Client {
  constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
  ping(argument: api_pb.PingRequest, callback: grpc.requestCallback<api_pb.PingResponse>): grpc.ClientUnaryCall;
  ping(argument: api_pb.PingRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<api_pb.PingResponse>): grpc.ClientUnaryCall;
  ping(argument: api_pb.PingRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<api_pb.PingResponse>): grpc.ClientUnaryCall;
  sendMessage(argument: api_pb.ChatMessage, callback: grpc.requestCallback<api_pb.SendMessageResponse>): grpc.ClientUnaryCall;
  sendMessage(argument: api_pb.ChatMessage, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<api_pb.SendMessageResponse>): grpc.ClientUnaryCall;
  sendMessage(argument: api_pb.ChatMessage, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<api_pb.SendMessageResponse>): grpc.ClientUnaryCall;
  subscribeToNewMessages(argument: api_pb.SubscribeToNewMessagesRequest, metadataOrOptions?: grpc.Metadata | grpc.CallOptions | null): grpc.ClientReadableStream<api_pb.ChatMessageWithTimestamp>;
  subscribeToNewMessages(argument: api_pb.SubscribeToNewMessagesRequest, metadata?: grpc.Metadata | null, options?: grpc.CallOptions | null): grpc.ClientReadableStream<api_pb.ChatMessageWithTimestamp>;
  getNodeID(argument: api_pb.GetNodeIDRequest, callback: grpc.requestCallback<api_pb.GetNodeIDResponse>): grpc.ClientUnaryCall;
  getNodeID(argument: api_pb.GetNodeIDRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<api_pb.GetNodeIDResponse>): grpc.ClientUnaryCall;
  getNodeID(argument: api_pb.GetNodeIDRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<api_pb.GetNodeIDResponse>): grpc.ClientUnaryCall;
}
