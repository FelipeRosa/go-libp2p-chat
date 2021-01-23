import { ipcRenderer } from "electron"
import React, { useContext, useEffect, useReducer } from "react"
import { render } from "react-dom"
import { ChatMessage } from "../common/ipc"
import { AppStateContext } from "./context"
import "./index.css"
import { reducer } from "./reducer"

const App = () => {
    const [state, dispatch] = useReducer(reducer, {
        connected: false,
        chat: { messages: [] },
    })

    useEffect(() => {
        ipcRenderer.on("chat.new-message", (_e, msg: ChatMessage) => {
            dispatch({ type: "new-message", message: msg })
        })

        ipcRenderer.on("chat.connected", (_e, address: string) => {
            dispatch({ type: "connected", address })
        })

        return () => {
            ipcRenderer.removeAllListeners("chat.new-message")
            ipcRenderer.removeAllListeners("chat.connected")
        }
    }, [state])

    const Connect = () => {
        const addrInput = React.createRef<HTMLInputElement>()

        return (
            <div>
                <div>Bootstrap node address</div>
                <div>
                    <input type={"text"} ref={addrInput} />
                </div>
                <div>
                    <input
                        type={"button"}
                        value={"Connect"}
                        onClick={() => {
                            if (
                                addrInput.current !== null &&
                                addrInput.current.value.length > 0
                            ) {
                                ipcRenderer.send(
                                    "chat.connect",
                                    addrInput.current.value,
                                )
                            }
                        }}
                    />
                </div>
            </div>
        )
    }

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
            {state.connected ? <Messages /> : <Connect />}
        </AppStateContext.Provider>
    )
}

render(<App />, document.getElementById("root"))
