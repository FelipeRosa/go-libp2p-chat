import * as grpc from "@grpc/grpc-js"
import type { ChildProcessWithoutNullStreams } from "child_process"
import * as child_process from "child_process"
import { app, BrowserWindow, ipcMain, Menu } from "electron"
import getPort from "get-port"
import { ApiClient } from "../../gen/api_grpc_pb"
import {
    ChatMessage as ApiChatMessage,
    ChatMessageWithTimestamp,
    SubscribeToNewMessagesRequest,
} from "../../gen/api_pb"
import { ChatMessage } from "../common/ipc"

class State {
    goNode: ChildProcessWithoutNullStreams | null
    apiClient: ApiClient | null

    constructor() {
        this.goNode = null
        this.apiClient = null
    }

    close() {
        this.apiClient?.close()
        this.goNode?.kill()
    }
}

let state = new State()

app.whenReady().then(() => {
    const window = new BrowserWindow({
        title: "libp2p chat",
        width: 640,
        height: 480,
        webPreferences: {
            nodeIntegration: true,
        },
    })

    window
        .loadFile("./build/index.html")
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

    ipcMain.on("chat.connect", (_e, address: string) => {
        state.close()

        Promise.all([
            getPort({ port: getPort.makeRange(40000, 42000) }),
            getPort({ port: getPort.makeRange(40000, 42000) }),
        ]).then(([nodePort, apiPort]) => {
            const goNodeArgs: string[] = [
                "-port",
                nodePort.toString(),
                "-api-port",
                apiPort.toString(),
            ]
            if (address.length > 0) {
                goNodeArgs.push("-bootstrap-addrs")
                goNodeArgs.push(address)
            }

            console.log(
                `starting chat-gonode with args: ${JSON.stringify(goNodeArgs)}`,
            )

            state.goNode = child_process.spawn("./chat-gonode", goNodeArgs, {
                detached: false,
            })
            state.goNode.stderr.on("data", (d: Buffer) =>
                console.log("chat-gonode:", d.toString()),
            )
            state.goNode.on("close", () =>
                console.log("chat-gonode closed", state.goNode?.exitCode),
            )

            // give some time for the local node to be started
            setTimeout(() => {
                state.apiClient = new ApiClient(
                    `localhost:${apiPort}`,
                    grpc.credentials.createInsecure(),
                )
                const newMessagesStream = state.apiClient.subscribeToNewMessages(
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

                window.webContents.send("chat.connected", address)
            }, 1000)
        })
    })

    ipcMain.on("chat.send", (_e, msg: string) => {
        const chatMsg = new ApiChatMessage()
        chatMsg.setValue(msg)

        state.apiClient?.sendMessage(chatMsg, (err, res) => {
            console.log(err, res)
        })
    })
})

app.on("window-all-closed", () => {
    state.close()
    app.quit()
})
