import { ChatMessage } from "../common/ipc"

export type AppState = {
    chat: {
        messages: Array<ChatMessage>
    }
}
