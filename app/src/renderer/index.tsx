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
                <div>
                    <div>
                        Bootstrap node address (if empty, starts a bootstrap
                        node and does not connect to any networks)
                    </div>
                    <div>
                        <input type={"text"} ref={addrInput} />
                    </div>
                </div>
                <div>
                    <input
                        type={"button"}
                        value={"Connect"}
                        onClick={() => {
                            if (addrInput.current !== null) {
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
            dispatch,
        } = useContext(AppStateContext)

        const inputBox = React.createRef<HTMLInputElement>()

        return (
            <div>
                <div>
                    <input type={"text"} ref={inputBox} />
                    <input
                        type={"button"}
                        value={"Send"}
                        onClick={() => {
                            if (
                                inputBox.current !== null &&
                                inputBox.current.value.trimEnd().length > 0
                            ) {
                                const msg = inputBox.current.value.trimEnd()
                                ipcRenderer.send("chat.send", msg)
                                inputBox.current.value = ""

                                dispatch({
                                    type: "new-message",
                                    message: {
                                        senderId: "You",
                                        timestamp: Number(new Date()) / 1000,
                                        value: msg,
                                    },
                                })
                            }
                        }}
                    />
                </div>

                <div>
                    {messages.map((msg, index) => (
                        <div key={index}>
                            <div
                                style={{
                                    display: "inline-block",
                                    marginRight: "4px",
                                }}
                            >
                                {new Date(
                                    msg.timestamp * 1000,
                                ).toLocaleTimeString()}
                            </div>
                            <div
                                style={{
                                    display: "inline-block",
                                    marginRight: "4px",
                                }}
                            >
                                {msg.senderId}:
                            </div>
                            <div style={{ display: "inline-block" }}>
                                {msg.value}
                            </div>
                        </div>
                    ))}
                </div>
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
