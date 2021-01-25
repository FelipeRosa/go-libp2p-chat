// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var api_pb = require('./api_pb.js');

function serialize_api_ChatMessage(arg) {
  if (!(arg instanceof api_pb.ChatMessage)) {
    throw new Error('Expected argument of type api.ChatMessage');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_api_ChatMessage(buffer_arg) {
  return api_pb.ChatMessage.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_api_ChatMessageWithTimestamp(arg) {
  if (!(arg instanceof api_pb.ChatMessageWithTimestamp)) {
    throw new Error('Expected argument of type api.ChatMessageWithTimestamp');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_api_ChatMessageWithTimestamp(buffer_arg) {
  return api_pb.ChatMessageWithTimestamp.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_api_GetNodeIDRequest(arg) {
  if (!(arg instanceof api_pb.GetNodeIDRequest)) {
    throw new Error('Expected argument of type api.GetNodeIDRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_api_GetNodeIDRequest(buffer_arg) {
  return api_pb.GetNodeIDRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_api_GetNodeIDResponse(arg) {
  if (!(arg instanceof api_pb.GetNodeIDResponse)) {
    throw new Error('Expected argument of type api.GetNodeIDResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_api_GetNodeIDResponse(buffer_arg) {
  return api_pb.GetNodeIDResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_api_PingRequest(arg) {
  if (!(arg instanceof api_pb.PingRequest)) {
    throw new Error('Expected argument of type api.PingRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_api_PingRequest(buffer_arg) {
  return api_pb.PingRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_api_PingResponse(arg) {
  if (!(arg instanceof api_pb.PingResponse)) {
    throw new Error('Expected argument of type api.PingResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_api_PingResponse(buffer_arg) {
  return api_pb.PingResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_api_SendMessageResponse(arg) {
  if (!(arg instanceof api_pb.SendMessageResponse)) {
    throw new Error('Expected argument of type api.SendMessageResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_api_SendMessageResponse(buffer_arg) {
  return api_pb.SendMessageResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_api_SubscribeToNewMessagesRequest(arg) {
  if (!(arg instanceof api_pb.SubscribeToNewMessagesRequest)) {
    throw new Error('Expected argument of type api.SubscribeToNewMessagesRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_api_SubscribeToNewMessagesRequest(buffer_arg) {
  return api_pb.SubscribeToNewMessagesRequest.deserializeBinary(new Uint8Array(buffer_arg));
}


var ApiService = exports.ApiService = {
  ping: {
    path: '/api.Api/Ping',
    requestStream: false,
    responseStream: false,
    requestType: api_pb.PingRequest,
    responseType: api_pb.PingResponse,
    requestSerialize: serialize_api_PingRequest,
    requestDeserialize: deserialize_api_PingRequest,
    responseSerialize: serialize_api_PingResponse,
    responseDeserialize: deserialize_api_PingResponse,
  },
  sendMessage: {
    path: '/api.Api/SendMessage',
    requestStream: false,
    responseStream: false,
    requestType: api_pb.ChatMessage,
    responseType: api_pb.SendMessageResponse,
    requestSerialize: serialize_api_ChatMessage,
    requestDeserialize: deserialize_api_ChatMessage,
    responseSerialize: serialize_api_SendMessageResponse,
    responseDeserialize: deserialize_api_SendMessageResponse,
  },
  subscribeToNewMessages: {
    path: '/api.Api/SubscribeToNewMessages',
    requestStream: false,
    responseStream: true,
    requestType: api_pb.SubscribeToNewMessagesRequest,
    responseType: api_pb.ChatMessageWithTimestamp,
    requestSerialize: serialize_api_SubscribeToNewMessagesRequest,
    requestDeserialize: deserialize_api_SubscribeToNewMessagesRequest,
    responseSerialize: serialize_api_ChatMessageWithTimestamp,
    responseDeserialize: deserialize_api_ChatMessageWithTimestamp,
  },
  getNodeID: {
    path: '/api.Api/GetNodeID',
    requestStream: false,
    responseStream: false,
    requestType: api_pb.GetNodeIDRequest,
    responseType: api_pb.GetNodeIDResponse,
    requestSerialize: serialize_api_GetNodeIDRequest,
    requestDeserialize: deserialize_api_GetNodeIDRequest,
    responseSerialize: serialize_api_GetNodeIDResponse,
    responseDeserialize: deserialize_api_GetNodeIDResponse,
  },
};

exports.ApiClient = grpc.makeGenericClientConstructor(ApiService);
