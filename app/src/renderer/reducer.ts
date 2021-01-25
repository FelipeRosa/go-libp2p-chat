import { ChatMessage, LocalNodeInfo } from "../common/ipc"
import { AppState } from "./entities"

export type Msg =
    | {
          type: "new-message"
          message: ChatMessage
      }
    | {
          type: "connected"
          localNodeInfo: LocalNodeInfo
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

        case "connected":
            return {
                ...prevState,
                connected: true,
                localNodeInfo: msg.localNodeInfo,
            }

        default:
            return prevState
    }
}
