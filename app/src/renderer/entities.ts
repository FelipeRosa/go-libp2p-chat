import { ChatMessage, LocalNodeInfo } from "../common/ipc"

export type AppState = {
    connected: boolean // for now we have only 1 chat room
    localNodeInfo: LocalNodeInfo | null
    chat: {
        messages: Array<ChatMessage>
    }
}
