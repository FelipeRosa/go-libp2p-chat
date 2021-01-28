import { ChatMessage, LocalNodeInfo } from "../common/ipc"

export enum ConnState {
    Disconnected,
    Connecting,
    Connected,
}

export type NotificationMessage = {
    type: "notification"
    timestamp: number
    value: string
}

export type AppState = {
    connectionState: ConnState
    localNodeInfo: LocalNodeInfo | null

    // only 1 room for now
    chat: {
        contents: Array<ChatMessage | NotificationMessage>
    }
}
