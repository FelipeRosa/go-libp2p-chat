import { createContext, Dispatch } from "react"
import { AppState } from "./entities"
import { Msg } from "./reducer"

export type AppStateContextValue = {
    state: AppState
    dispatch: Dispatch<Msg>
}

export const AppStateContext = createContext<AppStateContextValue>({
    state: {
        connected: false,
        localNodeInfo: null,
        chat: { messages: [] },
    },
    dispatch: () => {},
})
