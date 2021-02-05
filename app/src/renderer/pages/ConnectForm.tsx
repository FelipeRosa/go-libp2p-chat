import { ipcRenderer } from "electron"
import React from "react"

export const ConnectForm = () => {
    const nicknameInput = React.createRef<HTMLInputElement>()
    const roomInput = React.createRef<HTMLInputElement>()
    const addrInput = React.createRef<HTMLTextAreaElement>()

    return (
        <form className={"connect-form"} onSubmit={(e) => e.preventDefault()}>
            <div className={"label"}>Nickname*</div>
            <input
                className={"input"}
                type={"text"}
                ref={nicknameInput}
                autoFocus={true}
            />

            <div className={"label"}>Room*</div>
            <input className={"input"} type={"text"} ref={roomInput} />

            <div className={"label"}>
                <span>Bootstrap nodes addresses</span>{" "}
                <span style={{ color: "rgba(248, 248, 242, 0.6)" }}>
                    (if empty, starts a bootstrap node and does not connect to
                    any networks)
                </span>
            </div>
            <textarea
                className={"input connect-node-addrs-input"}
                placeholder={"Bootstrap node addresses..."}
                rows={4}
                ref={addrInput}
            />
            <input
                type={"submit"}
                value={"Connect"}
                onClick={() => {
                    if (
                        nicknameInput.current !== null &&
                        nicknameInput.current.value.trim().length > 0 &&
                        roomInput.current !== null &&
                        roomInput.current.value.trim().length > 0 &&
                        addrInput.current !== null
                    ) {
                        ipcRenderer.send(
                            "chat.connect",
                            nicknameInput.current.value.trim(),
                            roomInput.current.value.trim(),
                            addrInput.current.value.trim(),
                        )
                    }
                }}
            />
        </form>
    )
}
