import * as grpc from "@grpc/grpc-js"
import { app, BrowserWindow, Menu } from "electron"
import { ApiClient } from "../../gen/api_grpc_pb"
import {
    ChatMessageWithTimestamp,
    SubscribeToNewMessagesRequest,
} from "../../gen/api_pb"
import { ChatMessage } from "../common/ipc"

app.whenReady().then(() => {
    const window = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
    })

    window
        .loadFile("./dist/index.html")
        .then(() => console.log("window loaded"))

    const menu = Menu.buildFromTemplate([
        {
            label: "Help",
            submenu: [
                {
                    label: "Toggle development tools",
                    click: () => {
                        if (window.webContents.isDevToolsOpened()) {
                            window.webContents.closeDevTools()
                        } else {
                            window.webContents.openDevTools()
                        }
                    },
                },
            ],
        },
    ])
    Menu.setApplicationMenu(menu)

    const apiClient = new ApiClient(
        "localhost:4000",
        grpc.credentials.createInsecure(),
    )
    const newMessagesStream = apiClient.subscribeToNewMessages(
        new SubscribeToNewMessagesRequest(),
    )
    newMessagesStream.on("data", (msg: ChatMessageWithTimestamp) =>
        window.webContents.send(`chat.new-message`, {
            senderId: msg.getSenderid(),
            timestamp: msg.getTimestamp(),
            value: msg.getValue(),
        } as ChatMessage),
    )
    newMessagesStream.on("end", () => console.log("stream ended"))
})

app.on("window-all-closed", () => {
    app.quit()
})
