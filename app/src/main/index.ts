import * as grpc from "@grpc/grpc-js"
import type { ChildProcessWithoutNullStreams } from "child_process"
import * as child_process from "child_process"
import { app, BrowserWindow, dialog, ipcMain, Menu } from "electron"
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
        minWidth: 320,
        minHeight: 240,
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

    ipcMain.on("chat.connect", (_e, nickname: string, address: string) => {
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
            state.goNode.on("close", () =>
                console.log("chat-gonode closed", state.goNode?.exitCode),
            )

            const tryConnect = async () => {
                let nodeId = ""

                while (true) {
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

                        break
                    } catch (e) {
                        await new Promise((resolve) => setTimeout(resolve, 200))
                    }
                }

                // we are connected
                // subscribe to new messages
                const newMessagesStream = state.apiClient.subscribeToNewMessages(
                    new SubscribeToNewMessagesRequest(),
                )
                newMessagesStream.on("data", (msg: ApiChatMessage) => {
                    const senderId = msg.getSenderId()

                    // need to get the sender nickname
                    const getNicknameReq = new GetNicknameRequest()
                    getNicknameReq.setPeerId(senderId)
                    state.apiClient?.getNickname(getNicknameReq, (err, res) => {
                        window.webContents.send(`chat.new-message`, {
                            sender: {
                                id: senderId,
                                nickname: res?.getNickname() || "Unnamed",
                            },
                            timestamp: msg.getTimestamp(),
                            value: msg.getValue(),
                        } as ChatMessage)
                    })
                })
                newMessagesStream.on("end", () => console.log("stream ended"))

                const setNicknameReq = new SetNicknameRequest()
                setNicknameReq.setNickname(nickname)
                const setNickname = new Promise<void>((resolve, reject) => {
                    if (state.apiClient === null) {
                        return reject()
                    }

                    state.apiClient.setNickname(setNicknameReq, (err, res) => {
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
                                resolve(res?.getRoomName() || "No room name")
                            },
                        )
                    },
                )
                const currentRoomName = await getCurrentRoomName

                return [nodeId, currentRoomName]
            }

            tryConnect()
                .then(([nodeId, roomName]) => {
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
    })

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
