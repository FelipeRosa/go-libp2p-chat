export type ChatMessage = {
    type: "chat-message"
    sender: {
        id: string
        nickname: string
    }
    timestamp: number
    value: string
}

export type LocalNodeInfo = {
    address: string
    id: string
    nickname: string
    currentRoomName: string
}
