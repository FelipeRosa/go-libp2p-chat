import { ipcRenderer } from "electron"
import React from "react"

export const ConnectForm = () => {
    const nicknameInput = React.createRef<HTMLInputElement>()
    const addrInput = React.createRef<HTMLTextAreaElement>()

    return (
        <form className={"connect-form"} onSubmit={(e) => e.preventDefault()}>
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
                    (if empty, starts a bootstrap node and does not connect to
                    any networks)
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
