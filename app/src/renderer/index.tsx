import { ipcRenderer } from "electron"
import React, { useContext, useEffect, useReducer } from "react"
import { render } from "react-dom"
import { ChatMessage, LocalNodeInfo } from "../common/ipc"
import { AppStateContext } from "./context"
import "./index.css"
import { reducer } from "./reducer"

const App = () => {
    const [state, dispatch] = useReducer(reducer, {
        connected: false,
        localNodeInfo: null,
        chat: { messages: [] },
    })

    useEffect(() => {
        ipcRenderer.on("chat.new-message", (_e, msg: ChatMessage) => {
            dispatch({ type: "new-message", message: msg })
        })

        ipcRenderer.on("chat.connected", (_e, localNodeInfo: LocalNodeInfo) => {
            dispatch({ type: "connected", localNodeInfo })
        })

        return () => {
            ipcRenderer.removeAllListeners("chat.new-message")
            ipcRenderer.removeAllListeners("chat.connected")
        }
    }, [state])

    const Connect = () => {
        const nicknameInput = React.createRef<HTMLInputElement>()
        const addrInput = React.createRef<HTMLTextAreaElement>()

        return (
            <form
                className={"connect-form"}
                onSubmit={(e) => e.preventDefault()}
            >
                <div className={"connect-nickname-label"}>Nickname*</div>
                <input
                    className={"connect-nickname-input"}
                    type={"text"}
                    ref={nicknameInput}
                    autoFocus={true}
                />

                <div className={"connect-node-addrs-label"}>
                    <span>Bootstrap nodes address</span>{" "}
                    <span style={{ color: "rgba(248, 248, 242, 0.6)" }}>
                        (if empty, starts a bootstrap node and does not connect
                        to any networks)
                    </span>
                </div>
                <textarea
                    className={"connect-node-addrs-input"}
                    placeholder={"Bootstrap node addresses..."}
                    rows={4}
                    ref={addrInput}
                />
                <input
                    className={"connect-node-addrs-btn"}
                    type={"submit"}
                    value={"Connect"}
                    onClick={() => {
                        if (
                            nicknameInput.current !== null &&
                            nicknameInput.current.value.trim().length > 0 &&
                            addrInput.current !== null
                        ) {
                            ipcRenderer.send(
                                "chat.connect",
                                nicknameInput.current.value.trim(),
                                addrInput.current.value,
                            )
                        }
                    }}
                />
            </form>
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
        const msgsDiv = React.createRef<HTMLDivElement>()

        // always show the latest messages
        useEffect(() => {
            if (msgsDiv.current !== null) {
                msgsDiv.current.scrollTop = msgsDiv.current.scrollHeight
            }
        }, [messages])

        const formatTimestamp = (ts: number): string => {
            const d = new Date(ts * 1000)
            const h = d.getHours().toString().padStart(2, "0")
            const m = d.getMinutes().toString().padStart(2, "0")

            return `${h}:${m}`
        }

        const sendMsg = () => {
            if (
                state.localNodeInfo !== null &&
                inputBox.current !== null &&
                inputBox.current.value.trimEnd().length > 0
            ) {
                const msg = inputBox.current.value.trimEnd()
                ipcRenderer.send("chat.send", msg)
                inputBox.current.value = ""

                dispatch({
                    type: "new-message",
                    message: {
                        sender: {
                            id: state.localNodeInfo.id,
                            nickname: state.localNodeInfo.nickname,
                        },
                        timestamp: Number(new Date()) / 1000,
                        value: msg,
                    },
                })
            }
        }

        return (
            <div className={"chat"}>
                <div className={"room-info"}>
                    {state.localNodeInfo && (
                        <div>
                            <div className={"room-name"}>
                                Room:{" "}
                                <b>{state.localNodeInfo.currentRoomName}</b>
                            </div>
                            <div className={"local-node-id"}>
                                <b>Local Node Address</b>:{" "}
                                {state.localNodeInfo.address}
                            </div>
                        </div>
                    )}
                </div>

                <div className={"chat-messages"} ref={msgsDiv}>
                    {messages.map((msg, index) => (
                        <div key={index} className={"chat-message"}>
                            <div className={"chat-message-timestamp"}>
                                {formatTimestamp(msg.timestamp)}
                            </div>
                            <div className={"chat-message-sender"}>
                                {msg.sender.nickname}
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
                        autoFocus={true}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                sendMsg()
                            }
                        }}
                        ref={inputBox}
                    />
                    <input
                        className={"chat-send-btn"}
                        type={"button"}
                        value={"Send"}
                        onClick={sendMsg}
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
