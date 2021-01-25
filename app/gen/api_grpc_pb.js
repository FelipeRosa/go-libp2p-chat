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

function serialize_api_GetCurrentRoomNameRequest(arg) {
  if (!(arg instanceof api_pb.GetCurrentRoomNameRequest)) {
    throw new Error('Expected argument of type api.GetCurrentRoomNameRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_api_GetCurrentRoomNameRequest(buffer_arg) {
  return api_pb.GetCurrentRoomNameRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_api_GetCurrentRoomNameResponse(arg) {
  if (!(arg instanceof api_pb.GetCurrentRoomNameResponse)) {
    throw new Error('Expected argument of type api.GetCurrentRoomNameResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_api_GetCurrentRoomNameResponse(buffer_arg) {
  return api_pb.GetCurrentRoomNameResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_api_GetNicknameRequest(arg) {
  if (!(arg instanceof api_pb.GetNicknameRequest)) {
    throw new Error('Expected argument of type api.GetNicknameRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_api_GetNicknameRequest(buffer_arg) {
  return api_pb.GetNicknameRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_api_GetNicknameResponse(arg) {
  if (!(arg instanceof api_pb.GetNicknameResponse)) {
    throw new Error('Expected argument of type api.GetNicknameResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_api_GetNicknameResponse(buffer_arg) {
  return api_pb.GetNicknameResponse.deserializeBinary(new Uint8Array(buffer_arg));
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

function serialize_api_SendMessageRequest(arg) {
  if (!(arg instanceof api_pb.SendMessageRequest)) {
    throw new Error('Expected argument of type api.SendMessageRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_api_SendMessageRequest(buffer_arg) {
  return api_pb.SendMessageRequest.deserializeBinary(new Uint8Array(buffer_arg));
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

function serialize_api_SetNicknameRequest(arg) {
  if (!(arg instanceof api_pb.SetNicknameRequest)) {
    throw new Error('Expected argument of type api.SetNicknameRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_api_SetNicknameRequest(buffer_arg) {
  return api_pb.SetNicknameRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_api_SetNicknameResponse(arg) {
  if (!(arg instanceof api_pb.SetNicknameResponse)) {
    throw new Error('Expected argument of type api.SetNicknameResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_api_SetNicknameResponse(buffer_arg) {
  return api_pb.SetNicknameResponse.deserializeBinary(new Uint8Array(buffer_arg));
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
    requestType: api_pb.SendMessageRequest,
    responseType: api_pb.SendMessageResponse,
    requestSerialize: serialize_api_SendMessageRequest,
    requestDeserialize: deserialize_api_SendMessageRequest,
    responseSerialize: serialize_api_SendMessageResponse,
    responseDeserialize: deserialize_api_SendMessageResponse,
  },
  subscribeToNewMessages: {
    path: '/api.Api/SubscribeToNewMessages',
    requestStream: false,
    responseStream: true,
    requestType: api_pb.SubscribeToNewMessagesRequest,
    responseType: api_pb.ChatMessage,
    requestSerialize: serialize_api_SubscribeToNewMessagesRequest,
    requestDeserialize: deserialize_api_SubscribeToNewMessagesRequest,
    responseSerialize: serialize_api_ChatMessage,
    responseDeserialize: deserialize_api_ChatMessage,
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
  setNickname: {
    path: '/api.Api/SetNickname',
    requestStream: false,
    responseStream: false,
    requestType: api_pb.SetNicknameRequest,
    responseType: api_pb.SetNicknameResponse,
    requestSerialize: serialize_api_SetNicknameRequest,
    requestDeserialize: deserialize_api_SetNicknameRequest,
    responseSerialize: serialize_api_SetNicknameResponse,
    responseDeserialize: deserialize_api_SetNicknameResponse,
  },
  getNickname: {
    path: '/api.Api/GetNickname',
    requestStream: false,
    responseStream: false,
    requestType: api_pb.GetNicknameRequest,
    responseType: api_pb.GetNicknameResponse,
    requestSerialize: serialize_api_GetNicknameRequest,
    requestDeserialize: deserialize_api_GetNicknameRequest,
    responseSerialize: serialize_api_GetNicknameResponse,
    responseDeserialize: deserialize_api_GetNicknameResponse,
  },
  getCurrentRoomName: {
    path: '/api.Api/GetCurrentRoomName',
    requestStream: false,
    responseStream: false,
    requestType: api_pb.GetCurrentRoomNameRequest,
    responseType: api_pb.GetCurrentRoomNameResponse,
    requestSerialize: serialize_api_GetCurrentRoomNameRequest,
    requestDeserialize: deserialize_api_GetCurrentRoomNameRequest,
    responseSerialize: serialize_api_GetCurrentRoomNameResponse,
    responseDeserialize: deserialize_api_GetCurrentRoomNameResponse,
  },
};

exports.ApiClient = grpc.makeGenericClientConstructor(ApiService);
