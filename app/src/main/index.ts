import * as grpc from "@grpc/grpc-js"
import type { ChildProcessWithoutNullStreams } from "child_process"
import * as child_process from "child_process"
import {
    app,
    BrowserWindow,
    dialog,
    ipcMain,
    Menu,
    MenuItemConstructorOptions,
} from "electron"
import getPort from "get-port"
import * as path from "path"
import { ApiClient } from "../../gen/api_grpc_pb"
import {
    ChatMessage as ApiChatMessage,
    GetCurrentRoomNameRequest,
    GetNicknameRequest,
    GetNodeIDRequest,
    SendMessageRequest,
    SetNicknameRequest,
    SubscribeToNewMessagesRequest,
} from "../../gen/api_pb"
import { ChatMessage, LocalNodeInfo } from "../common/ipc"

class State {
    goNode: ChildProcessWithoutNullStreams | null
    apiClient: ApiClient | null
    newMessagesStream: grpc.ClientReadableStream<ApiChatMessage> | null
    connecting: boolean

    constructor() {
        this.goNode = null
        this.apiClient = null
        this.newMessagesStream = null
        this.connecting = false
    }

    close() {
        this.newMessagesStream?.cancel()
        this.newMessagesStream = null

        this.apiClient?.close()
        this.apiClient = null

        this.goNode?.kill()
        this.goNode = null
    }
}

let state = new State()

app.whenReady().then(() => {
    const window = new BrowserWindow({
        title: "libp2p chat",
        width: 640,
        height: 480,
        minWidth: 320,
        minHeight: 240,
        webPreferences: {
            nodeIntegration: true,
        },
    })

    window
        .loadFile("./build/index.html")
        .then(() => console.log("window loaded"))

    const menuTemplate: MenuItemConstructorOptions[] = []
    if (process.platform === "darwin") {
        menuTemplate.push({
            label: app.name,
            role: "appMenu",
        })
    }

    menuTemplate.push({
        label: "Edit",
        submenu: [
            { role: "undo" },
            { role: "redo" },
            { type: "separator" },
            { role: "cut" },
            { role: "copy" },
            { role: "paste" },
            { role: "delete" },
            { role: "selectAll" },
        ],
    })

    menuTemplate.push({
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
    })
    const menu = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(menu)

    ipcMain.on(
        "chat.connect",
        (_e, nickname: string, bootstrapAddrs: string) => {
            state.close()

            state.connecting = true
            window.webContents.send("chat.connecting")

            Promise.all([getPort(), getPort()]).then(([nodePort, apiPort]) => {
                const goNodeArgs: string[] = [
                    "-port",
                    nodePort.toString(),
                    "-api.port",
                    apiPort.toString(),
                    "-api.local",
                ]
                if (bootstrapAddrs.length > 0) {
                    goNodeArgs.push("-bootstrap.addrs")
                    goNodeArgs.push(bootstrapAddrs.trim())
                }

                console.log(
                    `starting chat-gonode with args: ${JSON.stringify(
                        goNodeArgs,
                    )}`,
                )

                state.goNode = child_process.spawn(
                    path.join(app.getAppPath(), "chat-gonode"),
                    goNodeArgs,
                    {
                        detached: false,
                    },
                )
                state.goNode.stderr.on("data", (d: Buffer) =>
                    console.log("chat-gonode:", d.toString()),
                )
                state.goNode.on("close", () => {
                    // send message to renderer only if there was any apiClient
                    // connected
                    if (state.apiClient !== null) {
                        window.webContents.send("chat.disconnected")
                    }

                    if (state.connecting) {
                        state.connecting = false
                        throw new Error("failed to start local node")
                    }

                    console.log("chat-gonode closed")
                })

                const tryConnect = async () => {
                    let nodeId = ""

                    while (state.connecting) {
                        console.log("polling node...")
                        try {
                            state.apiClient = new ApiClient(
                                `localhost:${apiPort}`,
                                grpc.credentials.createInsecure(),
                            )

                            nodeId = await new Promise<string>(
                                (resolve, reject) => {
                                    if (state.apiClient === null) {
                                        return reject()
                                    }

                                    state.apiClient.getNodeID(
                                        new GetNodeIDRequest(),
                                        (err, res) => {
                                            if (err !== null) {
                                                return reject(err)
                                            }
                                            resolve(res?.getId() || "")
                                        },
                                    )
                                },
                            )

                            // connected
                            state.connecting = false
                        } catch (e) {
                            state.apiClient?.close()
                            state.apiClient = null

                            await new Promise((resolve) =>
                                setTimeout(resolve, 200),
                            )
                        }
                    }

                    if (state.apiClient === null) {
                        console.error(
                            "local node connection failed. stopping connection try",
                        )
                        return null
                    }

                    // subscribe to new messages
                    state.newMessagesStream = state.apiClient.subscribeToNewMessages(
                        new SubscribeToNewMessagesRequest(),
                    )
                    state.newMessagesStream.on(
                        "data",
                        (msg: ApiChatMessage) => {
                            const senderId = msg.getSenderId()

                            // need to get the sender nickname
                            const getNicknameReq = new GetNicknameRequest()
                            getNicknameReq.setPeerId(senderId)
                            state.apiClient?.getNickname(
                                getNicknameReq,
                                (err, res) => {
                                    const chatMessage: ChatMessage = {
                                        sender: {
                                            id: senderId,
                                            nickname:
                                                res?.getNickname() || "Unnamed",
                                        },
                                        timestamp: msg.getTimestamp(),
                                        value: msg.getValue(),
                                    }

                                    window.webContents.send(
                                        `chat.new-message`,
                                        chatMessage,
                                    )
                                },
                            )
                        },
                    )
                    state.newMessagesStream.on(
                        "error",
                        (err: grpc.ServiceError) => {
                            if (err.code === 1) {
                                return
                            }
                            throw err
                        },
                    )
                    state.newMessagesStream.on("end", () =>
                        console.log("stream ended"),
                    )

                    const setNicknameReq = new SetNicknameRequest()
                    setNicknameReq.setNickname(nickname)
                    const setNickname = new Promise<void>((resolve, reject) => {
                        if (state.apiClient === null) {
                            return reject()
                        }

                        state.apiClient.setNickname(setNicknameReq, (err) => {
                            if (err !== null) {
                                return reject(err)
                            }
                            resolve()
                        })
                    })
                    await setNickname

                    const getCurrentRoomName = new Promise<string>(
                        (resolve, reject) => {
                            if (state.apiClient === null) {
                                return reject()
                            }

                            state.apiClient.getCurrentRoomName(
                                new GetCurrentRoomNameRequest(),
                                (err, res) => {
                                    if (err !== null) {
                                        return reject()
                                    }
                                    resolve(
                                        res?.getRoomName() || "No room name",
                                    )
                                },
                            )
                        },
                    )
                    const currentRoomName = await getCurrentRoomName

                    return [nodeId, currentRoomName]
                }

                tryConnect()
                    .then((connectionData: string[] | null) => {
                        if (connectionData === null) {
                            return
                        }

                        const [nodeId, roomName] = connectionData

                        console.log(`connected to local node ID ${nodeId}`)
                        window.webContents.send("chat.connected", {
                            address: `/ip4/127.0.0.1/tcp/${nodePort}/p2p/${nodeId}`,
                            id: nodeId,
                            nickname: nickname,
                            currentRoomName: roomName,
                        } as LocalNodeInfo)
                    })
                    .catch((err) => {
                        dialog.showErrorBox("Error", err.toString())
                    })
            })
        },
    )

    ipcMain.on("chat.send", (_e, msg: string) => {
        const request = new SendMessageRequest()
        request.setValue(msg)

        state.apiClient?.sendMessage(request, (err, res) => {
            console.log(err, res)
        })
    })
})

app.on("window-all-closed", () => {
    state.close()
    app.quit()
})
