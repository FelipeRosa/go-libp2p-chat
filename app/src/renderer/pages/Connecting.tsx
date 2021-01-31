import React, { useEffect, useState } from "react"

export const Connecting = () => {
    const [thumbLeft, setThumbLeft] = useState(0)

    useEffect(() => {
        const intervalId = setInterval(() => {
            setThumbLeft(thumbLeft > 100 ? -200 : thumbLeft + 3)
        }, 10)

        return () => clearInterval(intervalId)
    }, [thumbLeft])

    return (
        <div className={"connecting-screen"}>
            <div className={"connecting-label"}>Connecting...</div>
            <div className={"connecting-feedback-bar"}>
                <div
                    className={"connecting-feedback-bar-thumb"}
                    style={{ left: thumbLeft }}
                />
            </div>
        </div>
    )
}
