import * as grpc from "@grpc/grpc-js"
import { app, BrowserWindow, Menu } from "electron"
import { ApiClient } from "../gen/api_grpc_pb"
import {
    ChatMessageWithTimestamp,
    SubscribeToNewMessagesRequest,
} from "../gen/api_pb"

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

    Menu.setApplicationMenu(null)

    const apiClient = new ApiClient(
        "localhost:4000",
        grpc.credentials.createInsecure(),
    )
    const newMessagesStream = apiClient.subscribeToNewMessages(
        new SubscribeToNewMessagesRequest(),
    )
    newMessagesStream.on("data", (d: ChatMessageWithTimestamp) =>
        console.log("data", d.getValue()),
    )
    newMessagesStream.on("end", () => console.log("stream ended"))
})

app.on("window-all-closed", () => {
    app.quit()
})
