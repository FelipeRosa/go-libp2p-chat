// package: api
// file: api.proto

import * as jspb from "google-protobuf";

export class PingRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PingRequest.AsObject;
  static toObject(includeInstance: boolean, msg: PingRequest): PingRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PingRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PingRequest;
  static deserializeBinaryFromReader(message: PingRequest, reader: jspb.BinaryReader): PingRequest;
}

export namespace PingRequest {
  export type AsObject = {
  }
}

export class PingResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PingResponse.AsObject;
  static toObject(includeInstance: boolean, msg: PingResponse): PingResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PingResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PingResponse;
  static deserializeBinaryFromReader(message: PingResponse, reader: jspb.BinaryReader): PingResponse;
}

export namespace PingResponse {
  export type AsObject = {
  }
}

export class SubscribeToNewMessagesRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubscribeToNewMessagesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SubscribeToNewMessagesRequest): SubscribeToNewMessagesRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SubscribeToNewMessagesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubscribeToNewMessagesRequest;
  static deserializeBinaryFromReader(message: SubscribeToNewMessagesRequest, reader: jspb.BinaryReader): SubscribeToNewMessagesRequest;
}

export namespace SubscribeToNewMessagesRequest {
  export type AsObject = {
  }
}

export class SendMessageRequest extends jspb.Message {
  getValue(): string;
  setValue(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SendMessageRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SendMessageRequest): SendMessageRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SendMessageRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SendMessageRequest;
  static deserializeBinaryFromReader(message: SendMessageRequest, reader: jspb.BinaryReader): SendMessageRequest;
}

export namespace SendMessageRequest {
  export type AsObject = {
    value: string,
  }
}

export class SendMessageResponse extends jspb.Message {
  getSent(): boolean;
  setSent(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SendMessageResponse.AsObject;
  static toObject(includeInstance: boolean, msg: SendMessageResponse): SendMessageResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SendMessageResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SendMessageResponse;
  static deserializeBinaryFromReader(message: SendMessageResponse, reader: jspb.BinaryReader): SendMessageResponse;
}

export namespace SendMessageResponse {
  export type AsObject = {
    sent: boolean,
  }
}

export class ChatMessage extends jspb.Message {
  getSenderId(): string;
  setSenderId(value: string): void;

  getTimestamp(): number;
  setTimestamp(value: number): void;

  getValue(): string;
  setValue(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChatMessage.AsObject;
  static toObject(includeInstance: boolean, msg: ChatMessage): ChatMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ChatMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChatMessage;
  static deserializeBinaryFromReader(message: ChatMessage, reader: jspb.BinaryReader): ChatMessage;
}

export namespace ChatMessage {
  export type AsObject = {
    senderId: string,
    timestamp: number,
    value: string,
  }
}

export class GetNodeIDRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetNodeIDRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetNodeIDRequest): GetNodeIDRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetNodeIDRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetNodeIDRequest;
  static deserializeBinaryFromReader(message: GetNodeIDRequest, reader: jspb.BinaryReader): GetNodeIDRequest;
}

export namespace GetNodeIDRequest {
  export type AsObject = {
  }
}

export class GetNodeIDResponse extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetNodeIDResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetNodeIDResponse): GetNodeIDResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetNodeIDResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetNodeIDResponse;
  static deserializeBinaryFromReader(message: GetNodeIDResponse, reader: jspb.BinaryReader): GetNodeIDResponse;
}

export namespace GetNodeIDResponse {
  export type AsObject = {
    id: string,
  }
}

export class SetNicknameRequest extends jspb.Message {
  getNickname(): string;
  setNickname(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SetNicknameRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SetNicknameRequest): SetNicknameRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SetNicknameRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SetNicknameRequest;
  static deserializeBinaryFromReader(message: SetNicknameRequest, reader: jspb.BinaryReader): SetNicknameRequest;
}

export namespace SetNicknameRequest {
  export type AsObject = {
    nickname: string,
  }
}

export class SetNicknameResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SetNicknameResponse.AsObject;
  static toObject(includeInstance: boolean, msg: SetNicknameResponse): SetNicknameResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SetNicknameResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SetNicknameResponse;
  static deserializeBinaryFromReader(message: SetNicknameResponse, reader: jspb.BinaryReader): SetNicknameResponse;
}

export namespace SetNicknameResponse {
  export type AsObject = {
  }
}

export class GetNicknameRequest extends jspb.Message {
  getPeerId(): string;
  setPeerId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetNicknameRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetNicknameRequest): GetNicknameRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetNicknameRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetNicknameRequest;
  static deserializeBinaryFromReader(message: GetNicknameRequest, reader: jspb.BinaryReader): GetNicknameRequest;
}

export namespace GetNicknameRequest {
  export type AsObject = {
    peerId: string,
  }
}

export class GetNicknameResponse extends jspb.Message {
  getNickname(): string;
  setNickname(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetNicknameResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetNicknameResponse): GetNicknameResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetNicknameResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetNicknameResponse;
  static deserializeBinaryFromReader(message: GetNicknameResponse, reader: jspb.BinaryReader): GetNicknameResponse;
}

export namespace GetNicknameResponse {
  export type AsObject = {
    nickname: string,
  }
}

export class GetCurrentRoomNameRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetCurrentRoomNameRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetCurrentRoomNameRequest): GetCurrentRoomNameRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetCurrentRoomNameRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetCurrentRoomNameRequest;
  static deserializeBinaryFromReader(message: GetCurrentRoomNameRequest, reader: jspb.BinaryReader): GetCurrentRoomNameRequest;
}

export namespace GetCurrentRoomNameRequest {
  export type AsObject = {
  }
}

export class GetCurrentRoomNameResponse extends jspb.Message {
  getRoomName(): string;
  setRoomName(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetCurrentRoomNameResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetCurrentRoomNameResponse): GetCurrentRoomNameResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetCurrentRoomNameResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetCurrentRoomNameResponse;
  static deserializeBinaryFromReader(message: GetCurrentRoomNameResponse, reader: jspb.BinaryReader): GetCurrentRoomNameResponse;
}

export namespace GetCurrentRoomNameResponse {
  export type AsObject = {
    roomName: string,
  }
}

