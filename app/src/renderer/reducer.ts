import { ChatMessage } from "../common/ipc"
import { AppState } from "./entities"

export type Msg = {
    type: "new-message"
    message: ChatMessage
}

export function reducer(prevState: AppState, msg: Msg): AppState {
    switch (msg.type) {
        case "new-message":
            const messages = [...prevState.chat.messages]
            messages.push(msg.message)

            return {
                ...prevState,
                chat: { messages },
            }

        default:
            return prevState
    }
}
