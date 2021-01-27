import { ChatMessage, LocalNodeInfo } from "../common/ipc"
import { AppState, ConnState } from "./entities"

export type Msg =
    | {
    type: "new-message"
    message: ChatMessage
}
    | { type: "connecting" }
    | {
    type: "connected"
    localNodeInfo: LocalNodeInfo
}
    | { type: "disconnected" }

export function reducer(prevState: AppState, msg: Msg): AppState {
    switch (msg.type) {
        case "new-message":
            const messages = [...prevState.chat.messages]
            messages.push(msg.message)

            return {
                ...prevState,
                chat: { messages },
            }

        case "connecting":
            return {
                ...prevState,
                connectionState: ConnState.Connecting,
            }

        case "connected":
            return {
                ...prevState,
                connectionState: ConnState.Connected,
                localNodeInfo: msg.localNodeInfo,
            }

        case "disconnected":
            return {
                ...prevState,
                connectionState: ConnState.Disconnected,
            }

        default:
            return prevState
    }
}
