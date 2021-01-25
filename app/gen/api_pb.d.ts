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
  getOk(): boolean;
  setOk(value: boolean): void;

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
    ok: boolean,
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

export class ChatMessageWithTimestamp extends jspb.Message {
  getSenderid(): string;
  setSenderid(value: string): void;

  getTimestamp(): number;
  setTimestamp(value: number): void;

  getValue(): string;
  setValue(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChatMessageWithTimestamp.AsObject;
  static toObject(includeInstance: boolean, msg: ChatMessageWithTimestamp): ChatMessageWithTimestamp.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ChatMessageWithTimestamp, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChatMessageWithTimestamp;
  static deserializeBinaryFromReader(message: ChatMessageWithTimestamp, reader: jspb.BinaryReader): ChatMessageWithTimestamp;
}

export namespace ChatMessageWithTimestamp {
  export type AsObject = {
    senderid: string,
    timestamp: number,
    value: string,
  }
}

export class ChatMessage extends jspb.Message {
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

