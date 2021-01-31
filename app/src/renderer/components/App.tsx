import React, { useContext } from "react"
import { AppStateContext } from "../context"
import { ConnState } from "../entities"
import { Chat } from "../pages/Chat"
import { ConnectForm } from "../pages/ConnectForm"
import { Connecting } from "../pages/Connecting"

export const App = () => {
    const { state } = useContext(AppStateContext)

    return state.connectionState === ConnState.Connected ? (
        <Chat />
    ) : state.connectionState === ConnState.Connecting ? (
        <Connecting />
    ) : (
        <ConnectForm />
    )
}
