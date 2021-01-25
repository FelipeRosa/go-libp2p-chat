// GENERATED CODE -- DO NOT EDIT!

// package: api
// file: api.proto

import * as api_pb from "./api_pb";
import * as grpc from "@grpc/grpc-js";

interface IApiService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  ping: grpc.MethodDefinition<api_pb.PingRequest, api_pb.PingResponse>;
  sendMessage: grpc.MethodDefinition<api_pb.SendMessageRequest, api_pb.SendMessageResponse>;
  subscribeToNewMessages: grpc.MethodDefinition<api_pb.SubscribeToNewMessagesRequest, api_pb.ChatMessage>;
  getNodeID: grpc.MethodDefinition<api_pb.GetNodeIDRequest, api_pb.GetNodeIDResponse>;
  setNickname: grpc.MethodDefinition<api_pb.SetNicknameRequest, api_pb.SetNicknameResponse>;
  getNickname: grpc.MethodDefinition<api_pb.GetNicknameRequest, api_pb.GetNicknameResponse>;
  getCurrentRoomName: grpc.MethodDefinition<api_pb.GetCurrentRoomNameRequest, api_pb.GetCurrentRoomNameResponse>;
}

export const ApiService: IApiService;

export interface IApiServer extends grpc.UntypedServiceImplementation {
  ping: grpc.handleUnaryCall<api_pb.PingRequest, api_pb.PingResponse>;
  sendMessage: grpc.handleUnaryCall<api_pb.SendMessageRequest, api_pb.SendMessageResponse>;
  subscribeToNewMessages: grpc.handleServerStreamingCall<api_pb.SubscribeToNewMessagesRequest, api_pb.ChatMessage>;
  getNodeID: grpc.handleUnaryCall<api_pb.GetNodeIDRequest, api_pb.GetNodeIDResponse>;
  setNickname: grpc.handleUnaryCall<api_pb.SetNicknameRequest, api_pb.SetNicknameResponse>;
  getNickname: grpc.handleUnaryCall<api_pb.GetNicknameRequest, api_pb.GetNicknameResponse>;
  getCurrentRoomName: grpc.handleUnaryCall<api_pb.GetCurrentRoomNameRequest, api_pb.GetCurrentRoomNameResponse>;
}

export class ApiClient extends grpc.Client {
  constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
  ping(argument: api_pb.PingRequest, callback: grpc.requestCallback<api_pb.PingResponse>): grpc.ClientUnaryCall;
  ping(argument: api_pb.PingRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<api_pb.PingResponse>): grpc.ClientUnaryCall;
  ping(argument: api_pb.PingRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<api_pb.PingResponse>): grpc.ClientUnaryCall;
  sendMessage(argument: api_pb.SendMessageRequest, callback: grpc.requestCallback<api_pb.SendMessageResponse>): grpc.ClientUnaryCall;
  sendMessage(argument: api_pb.SendMessageRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<api_pb.SendMessageResponse>): grpc.ClientUnaryCall;
  sendMessage(argument: api_pb.SendMessageRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<api_pb.SendMessageResponse>): grpc.ClientUnaryCall;
  subscribeToNewMessages(argument: api_pb.SubscribeToNewMessagesRequest, metadataOrOptions?: grpc.Metadata | grpc.CallOptions | null): grpc.ClientReadableStream<api_pb.ChatMessage>;
  subscribeToNewMessages(argument: api_pb.SubscribeToNewMessagesRequest, metadata?: grpc.Metadata | null, options?: grpc.CallOptions | null): grpc.ClientReadableStream<api_pb.ChatMessage>;
  getNodeID(argument: api_pb.GetNodeIDRequest, callback: grpc.requestCallback<api_pb.GetNodeIDResponse>): grpc.ClientUnaryCall;
  getNodeID(argument: api_pb.GetNodeIDRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<api_pb.GetNodeIDResponse>): grpc.ClientUnaryCall;
  getNodeID(argument: api_pb.GetNodeIDRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<api_pb.GetNodeIDResponse>): grpc.ClientUnaryCall;
  setNickname(argument: api_pb.SetNicknameRequest, callback: grpc.requestCallback<api_pb.SetNicknameResponse>): grpc.ClientUnaryCall;
  setNickname(argument: api_pb.SetNicknameRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<api_pb.SetNicknameResponse>): grpc.ClientUnaryCall;
  setNickname(argument: api_pb.SetNicknameRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<api_pb.SetNicknameResponse>): grpc.ClientUnaryCall;
  getNickname(argument: api_pb.GetNicknameRequest, callback: grpc.requestCallback<api_pb.GetNicknameResponse>): grpc.ClientUnaryCall;
  getNickname(argument: api_pb.GetNicknameRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<api_pb.GetNicknameResponse>): grpc.ClientUnaryCall;
  getNickname(argument: api_pb.GetNicknameRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<api_pb.GetNicknameResponse>): grpc.ClientUnaryCall;
  getCurrentRoomName(argument: api_pb.GetCurrentRoomNameRequest, callback: grpc.requestCallback<api_pb.GetCurrentRoomNameResponse>): grpc.ClientUnaryCall;
  getCurrentRoomName(argument: api_pb.GetCurrentRoomNameRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<api_pb.GetCurrentRoomNameResponse>): grpc.ClientUnaryCall;
  getCurrentRoomName(argument: api_pb.GetCurrentRoomNameRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<api_pb.GetCurrentRoomNameResponse>): grpc.ClientUnaryCall;
}
