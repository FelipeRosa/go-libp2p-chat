import { ChatMessage } from "../common/ipc"

export type AppState = {
    connected: boolean // for now we have only 1 chat room
    chat: {
        messages: Array<ChatMessage>
    }
}
