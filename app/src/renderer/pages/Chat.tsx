import { ipcRenderer } from "electron"
import React, { useContext, useEffect } from "react"
import { AppStateContext } from "../context"

export const Chat = () => {
    const {
        state: {
            localNodeInfo: localNodeInfo,
            chat: { contents, participants },
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
    }, [contents])

    const formatTimestamp = (ts: number): string => {
        const d = new Date(ts)
        const h = d.getHours().toString().padStart(2, "0")
        const m = d.getMinutes().toString().padStart(2, "0")

        return `${h}:${m}`
    }

    const sendMsg = () => {
        if (
            localNodeInfo !== null &&
            inputBox.current !== null &&
            inputBox.current.value.trimEnd().length > 0
        ) {
            const msg = inputBox.current.value.trimEnd()
            ipcRenderer.send("chat.send", msg, localNodeInfo.currentRoomName)
            inputBox.current.value = ""

            dispatch({
                type: "new-message",
                message: {
                    type: "chat-message",
                    sender: {
                        id: localNodeInfo.id,
                        nickname: localNodeInfo.nickname,
                    },
                    timestamp: Number(new Date()),
                    value: msg,
                },
            })
        }
    }

    return (
        <div className={"chat"}>
            <div className={"chat-room"}>
                <div className={"room-info"}>
                    {localNodeInfo && (
                        <div>
                            <div className={"room-name"}>
                                Room: <b>{localNodeInfo.currentRoomName}</b>
                            </div>
                            <div className={"local-node-id"}>
                                <b>Local Node Address</b>:{" "}
                                {localNodeInfo.address}
                            </div>
                        </div>
                    )}
                </div>

                <div className={"chat-participants"}>
                    <div className={"chat-participants-title"}>
                        In this room:
                    </div>

                    {participants.map((p, i) => (
                        <div key={i} className={"chat-participant"}>
                            {p.nickname.trim() || p.id}
                        </div>
                    ))}
                </div>
            </div>

            <div className={"chat-panel"}>
                <div className={"chat-contents"} ref={msgsDiv}>
                    {contents.map((msg, index) =>
                        msg.type === "chat-message" ? (
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
                        ) : (
                            <div key={index} className={"chat-notification"}>
                                <div className={"chat-message-timestamp"}>
                                    {formatTimestamp(msg.timestamp)}
                                </div>
                                <div className={"chat-message-value"}>
                                    {msg.value}
                                </div>
                            </div>
                        ),
                    )}
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
        </div>
    )
}
