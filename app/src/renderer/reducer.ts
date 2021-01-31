import { ChatMessage, LocalNodeInfo } from "../common/ipc"
import {
    AppState,
    ConnState,
    NotificationMessage,
    Participant,
} from "./entities"

export type Msg =
    | {
          type: "new-message"
          message: ChatMessage
      }
    | {
          type: "new-notification"
          message: NotificationMessage
      }
    | {
          type: "peer-joined"
          roomName: string
          id: string
      }
    | {
          type: "peer-left"
          roomName: string
          id: string
      }
    | {
          type: "participants"
          roomName: string
          participants: Array<Participant>
      }
    | { type: "connecting" }
    | {
          type: "connected"
          localNodeInfo: LocalNodeInfo
      }
    | { type: "disconnected" }

const addContent: (
    state: AppState,
    content: ChatMessage | NotificationMessage,
) => AppState = (state, content) => {
    const contents = [...state.chat.contents]
    contents.push(content)

    return {
        ...state,
        chat: { ...state.chat, contents },
    }
}

export function reducer(prevState: AppState, msg: Msg): AppState {
    switch (msg.type) {
        case "new-message":
        case "new-notification":
            return addContent(prevState, msg.message)

        case "peer-joined":
            return addContent(prevState, {
                type: "notification",
                timestamp: Number(new Date()),
                value: `Peer joined: ${msg.id}`,
            })

        case "peer-left":
            return addContent(prevState, {
                type: "notification",
                timestamp: Number(new Date()),
                value: `Peer left: ${msg.id}`,
            })

        case "participants":
            return {
                ...prevState,
                chat: {
                    ...prevState.chat,
                    participants: msg.participants,
                },
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
