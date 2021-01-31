// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var api_pb = require('./api_pb.js');

function serialize_api_Event(arg) {
  if (!(arg instanceof api_pb.Event)) {
    throw new Error('Expected argument of type api.Event');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_api_Event(buffer_arg) {
  return api_pb.Event.deserializeBinary(new Uint8Array(buffer_arg));
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

function serialize_api_GetRoomParticipantsRequest(arg) {
  if (!(arg instanceof api_pb.GetRoomParticipantsRequest)) {
    throw new Error('Expected argument of type api.GetRoomParticipantsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_api_GetRoomParticipantsRequest(buffer_arg) {
  return api_pb.GetRoomParticipantsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_api_GetRoomParticipantsResponse(arg) {
  if (!(arg instanceof api_pb.GetRoomParticipantsResponse)) {
    throw new Error('Expected argument of type api.GetRoomParticipantsResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_api_GetRoomParticipantsResponse(buffer_arg) {
  return api_pb.GetRoomParticipantsResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_api_JoinRoomRequest(arg) {
  if (!(arg instanceof api_pb.JoinRoomRequest)) {
    throw new Error('Expected argument of type api.JoinRoomRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_api_JoinRoomRequest(buffer_arg) {
  return api_pb.JoinRoomRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_api_JoinRoomResponse(arg) {
  if (!(arg instanceof api_pb.JoinRoomResponse)) {
    throw new Error('Expected argument of type api.JoinRoomResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_api_JoinRoomResponse(buffer_arg) {
  return api_pb.JoinRoomResponse.deserializeBinary(new Uint8Array(buffer_arg));
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

function serialize_api_SubscribeToEventsRequest(arg) {
  if (!(arg instanceof api_pb.SubscribeToEventsRequest)) {
    throw new Error('Expected argument of type api.SubscribeToEventsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_api_SubscribeToEventsRequest(buffer_arg) {
  return api_pb.SubscribeToEventsRequest.deserializeBinary(new Uint8Array(buffer_arg));
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
  joinRoom: {
    path: '/api.Api/JoinRoom',
    requestStream: false,
    responseStream: false,
    requestType: api_pb.JoinRoomRequest,
    responseType: api_pb.JoinRoomResponse,
    requestSerialize: serialize_api_JoinRoomRequest,
    requestDeserialize: deserialize_api_JoinRoomRequest,
    responseSerialize: serialize_api_JoinRoomResponse,
    responseDeserialize: deserialize_api_JoinRoomResponse,
  },
  getRoomParticipants: {
    path: '/api.Api/GetRoomParticipants',
    requestStream: false,
    responseStream: false,
    requestType: api_pb.GetRoomParticipantsRequest,
    responseType: api_pb.GetRoomParticipantsResponse,
    requestSerialize: serialize_api_GetRoomParticipantsRequest,
    requestDeserialize: deserialize_api_GetRoomParticipantsRequest,
    responseSerialize: serialize_api_GetRoomParticipantsResponse,
    responseDeserialize: deserialize_api_GetRoomParticipantsResponse,
  },
  subscribeToEvents: {
    path: '/api.Api/SubscribeToEvents',
    requestStream: false,
    responseStream: true,
    requestType: api_pb.SubscribeToEventsRequest,
    responseType: api_pb.Event,
    requestSerialize: serialize_api_SubscribeToEventsRequest,
    requestDeserialize: deserialize_api_SubscribeToEventsRequest,
    responseSerialize: serialize_api_Event,
    responseDeserialize: deserialize_api_Event,
  },
};

exports.ApiClient = grpc.makeGenericClientConstructor(ApiService);
