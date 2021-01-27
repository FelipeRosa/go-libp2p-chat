import { ChatMessage, LocalNodeInfo } from "../common/ipc"

export enum ConnState {
    Disconnected,
    Connecting,
    Connected,
}

export type AppState = {
    connectionState: ConnState // for now we have only 1 chat room
    localNodeInfo: LocalNodeInfo | null
    chat: {
        messages: Array<ChatMessage>
    }
}
