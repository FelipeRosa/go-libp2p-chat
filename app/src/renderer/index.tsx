import { ipcRenderer } from "electron"
import React, { useEffect, useReducer } from "react"
import { render } from "react-dom"
import { ChatMessage, LocalNodeInfo } from "../common/ipc"
import { App } from "./components/App"
import { AppStateContext } from "./context"
import { ConnState } from "./entities"
import "./index.css"
import { reducer } from "./reducer"

const Main = () => {
    const [state, dispatch] = useReducer(reducer, {
        connectionState: ConnState.Disconnected,
        localNodeInfo: null,
        chat: { contents: [], participants: [] },
    })

    useEffect(() => {
        ipcRenderer.on("room.new-message", (_e, msg: ChatMessage) => {
            dispatch({ type: "new-message", message: msg })
        })

        ipcRenderer.on("room.peer-joined", (_e, roomName, id) => {
            dispatch({ type: "peer-joined", roomName, id })
        })

        ipcRenderer.on("room.peer-left", (_e, roomName, id) => {
            dispatch({ type: "peer-left", roomName, id })
        })

        ipcRenderer.on("room.participants", (_e, roomName, participants) => {
            dispatch({ type: "participants", roomName, participants })
        })

        ipcRenderer.on("chat.connecting", () => {
            dispatch({ type: "connecting" })
        })

        ipcRenderer.on("chat.connected", (_e, localNodeInfo: LocalNodeInfo) => {
            dispatch({ type: "connected", localNodeInfo })
            dispatch({
                type: "new-notification",
                message: {
                    type: "notification",
                    timestamp: Number(new Date()),
                    value: "Connected",
                },
            })
        })

        ipcRenderer.on("chat.disconnected", () => {
            dispatch({ type: "disconnected" })
        })

        return () => {
            ipcRenderer.removeAllListeners("room.new-message")
            ipcRenderer.removeAllListeners("room.peer-joined")
            ipcRenderer.removeAllListeners("room.peer-left")
            ipcRenderer.removeAllListeners("room.participants")
            ipcRenderer.removeAllListeners("chat.connecting")
            ipcRenderer.removeAllListeners("chat.connected")
            ipcRenderer.removeAllListeners("chat.disconnected")
        }
    }, [state])

    return (
        <AppStateContext.Provider value={{ state, dispatch }}>
            <App />
        </AppStateContext.Provider>
    )
}

render(<Main />, document.getElementById("root"))
