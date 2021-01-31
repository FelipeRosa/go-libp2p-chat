import { createContext, Dispatch } from "react"
import { AppState, ConnState } from "./entities"
import { Msg } from "./reducer"

export type AppStateContextValue = {
    state: AppState
    dispatch: Dispatch<Msg>
}

export const AppStateContext = createContext<AppStateContextValue>({
    state: {
        connectionState: ConnState.Disconnected,
        localNodeInfo: null,
        chat: { contents: [], participants: [] },
    },
    dispatch: () => {},
})
