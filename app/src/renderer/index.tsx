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
                <div style={{ marginBottom: "16px" }}>
                    <span>Bootstrap nodes address</span>
                    {" "}
                    <span style={{color: "rgba(248, 248, 242, 0.6)"}}>
                        (if empty, starts a bootstrap node and does not connect
                        to any networks)
                    </span>
                </div>
                <div style={{ marginBottom: "8px" }}>
                    <input
                        placeholder={"Bootstrap node addresses..."}
                        type={"text"}
                        ref={addrInput}
                    />
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

        const formatTimestamp = (ts: number): string => {
            const d = new Date(ts * 1000)
            const h = d.getHours().toString().padStart(2, "0")
            const m = d.getMinutes().toString().padStart(2, "0")

            return `${h}:${m}`
        }

        console.log(document.body.clientHeight)

        return (
            <div>
                <div className={"room-info"}>
                    <div className={"room-name"}>Room Name</div>
                </div>

                <div className={"chat-messages"}>
                    {messages.map((msg, index) => (
                        <div key={index} className={"chat-message"}>
                            <div className={"chat-message-timestamp"}>
                                {formatTimestamp(msg.timestamp)}
                            </div>
                            <div className={"chat-message-sender"}>
                                {msg.senderId}
                            </div>
                            <div className={"chat-message-value"}>
                                {msg.value}
                            </div>
                        </div>
                    ))}
                </div>

                <div className={"chat-send"}>
                    <input
                        className={"chat-send-input"}
                        type={"text"}
                        placeholder={"Write message..."}
                        ref={inputBox}
                    />
                    <input
                        className={"chat-send-btn"}
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
