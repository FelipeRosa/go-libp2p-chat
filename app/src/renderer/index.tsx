import { ipcRenderer } from "electron"
import React, { useContext, useEffect, useReducer } from "react"
import { render } from "react-dom"
import { ChatMessage } from "../common/ipc"
import { AppStateContext } from "./context"
import "./index.css"
import { reducer } from "./reducer"

const App = () => {
    const [state, dispatch] = useReducer(reducer, { chat: { messages: [] } })

    useEffect(() => {
        ipcRenderer.on("chat.new-message", (_e, msg: ChatMessage) => {
            dispatch({ type: "new-message", message: msg })
        })

        return () => {
            ipcRenderer.removeAllListeners("chat.new-message")
        }
    }, [state])

    const Messages = () => {
        const {
            state: {
                chat: { messages },
            },
        } = useContext(AppStateContext)

        return (
            <div>
                <table>
                    {messages.map((msg, index) => (
                        <tr key={index}>
                            <td>
                                {new Date(
                                    msg.timestamp * 1000,
                                ).toLocaleTimeString()}
                            </td>
                            <td>{msg.senderId}:</td>
                            <td>{msg.value}</td>
                        </tr>
                    ))}
                </table>
            </div>
        )
    }

    return (
        <AppStateContext.Provider value={{ state, dispatch }}>
            <Messages />
        </AppStateContext.Provider>
    )
}

render(<App />, document.getElementById("root"))
