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
    Event as ApiEvent,
    GetNicknameRequest,
    GetNodeIDRequest,
    GetRoomParticipantsRequest,
    JoinRoomRequest,
    SendMessageRequest,
    SubscribeToEventsRequest,
} from "../../gen/api_pb"
import { ChatMessage, LocalNodeInfo } from "../common/ipc"

class State {
    goNode: ChildProcessWithoutNullStreams | null
    apiClient: ApiClient | null
    eventStream: grpc.ClientReadableStream<ApiEvent> | null
    getParticipantsInterval: NodeJS.Timeout | null
    connecting: boolean

    constructor() {
        this.goNode = null
        this.apiClient = null
        this.eventStream = null
        this.getParticipantsInterval = null
        this.connecting = false
    }

    close() {
        if (this.getParticipantsInterval !== null) {
            clearInterval(this.getParticipantsInterval)
            this.getParticipantsInterval = null
        }

        this.eventStream?.cancel()
        this.eventStream = null

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
        width: 800,
        height: 600,
        minWidth: 400,
        minHeight: 400,
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
        (
            _e,
            connectNickname: string,
            connectRoomName: string,
            bootstrapAddrs: string,
        ) => {
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

                    state.eventStream = state.apiClient.subscribeToEvents(
                        new SubscribeToEventsRequest(),
                    )
                    state.eventStream.on("data", (evt: ApiEvent) => {
                        switch (evt.getType()) {
                            case ApiEvent.Type.NEW_CHAT_MESSAGE:
                                {
                                    console.log(
                                        "handling NEW_CHAT_MESSAGE event",
                                    )

                                    const msg = evt
                                        .getNewChatMessage()
                                        ?.getChatMessage()
                                    if (!msg) {
                                        console.error("missing chat message")
                                        return
                                    }

                                    const senderId = msg.getSenderId()

                                    const roomName = evt
                                        .getNewChatMessage()
                                        ?.getRoomName()
                                    if (!roomName) {
                                        console.error("missing room name")
                                        return
                                    }

                                    // need to get the sender nickname
                                    const getNicknameReq = new GetNicknameRequest()
                                    getNicknameReq.setRoomName(roomName)
                                    getNicknameReq.setPeerId(senderId)
                                    state.apiClient?.getNickname(
                                        getNicknameReq,
                                        (err, res) => {
                                            const chatMessage: ChatMessage = {
                                                type: "chat-message",
                                                sender: {
                                                    id: senderId,
                                                    nickname:
                                                        res?.getNickname() ||
                                                        "Unnamed",
                                                },
                                                // the node sends in seconds, we need it in milliseconds
                                                timestamp:
                                                    msg.getTimestamp() * 1000,
                                                value: msg.getValue(),
                                            }

                                            window.webContents.send(
                                                `room.new-message`,
                                                chatMessage,
                                            )
                                        },
                                    )
                                }
                                break

                            case ApiEvent.Type.PEER_JOINED:
                                {
                                    console.log("handling PEER_JOINED event")

                                    const joinInfo = evt.getPeerJoined()
                                    if (!joinInfo) {
                                        console.error(
                                            "missing join information",
                                        )
                                    }

                                    window.webContents.send(
                                        "room.peer-joined",
                                        joinInfo?.getRoomName(),
                                        joinInfo?.getPeerId(),
                                    )
                                }
                                break

                            case ApiEvent.Type.PEER_LEFT:
                                {
                                    console.log("handling PEER_LEFT event")

                                    const leftInfo = evt.getPeerLeft()
                                    if (!leftInfo) {
                                        console.error(
                                            "missing left information",
                                        )
                                    }

                                    window.webContents.send(
                                        "room.peer-left",
                                        leftInfo?.getRoomName(),
                                        leftInfo?.getPeerId(),
                                    )
                                }
                                break

                            default:
                                console.log("skipping unknown event")
                                return
                        }
                    })
                    state.eventStream.on("error", (err: grpc.ServiceError) => {
                        if (err.code === 1) {
                            return
                        }
                        throw err
                    })
                    state.eventStream.on("end", () =>
                        console.log("stream ended"),
                    )

                    const joinRoomReq = new JoinRoomRequest()
                    joinRoomReq.setRoomName(connectRoomName)
                    joinRoomReq.setNickname(connectNickname)
                    const joinRoom = new Promise<void>((resolve, reject) => {
                        if (state.apiClient === null) {
                            return reject()
                        }

                        state.apiClient.joinRoom(joinRoomReq, (err) => {
                            if (err !== null) {
                                return reject(err)
                            }
                            resolve()
                        })
                    })
                    await joinRoom

                    state.getParticipantsInterval = setInterval(() => {
                        const req = new GetRoomParticipantsRequest()
                        req.setRoomName(connectRoomName)
                        state.apiClient?.getRoomParticipants(
                            req,
                            (err, res) => {
                                if (err !== null) {
                                    console.error(
                                        "failed getting room participants",
                                        err,
                                    )
                                }

                                const participants = res
                                    ?.getParticipantsList()
                                    .map((p) => p.toObject())
                                    .sort((p1, p2) =>
                                        p1.nickname < p2.nickname
                                            ? -1
                                            : p1.nickname === p2.nickname
                                            ? 0
                                            : 1,
                                    )

                                window.webContents.send(
                                    "room.participants",
                                    connectRoomName,
                                    participants || [],
                                )
                            },
                        )
                    }, 50)

                    return nodeId
                }

                tryConnect()
                    .then((nodeId: string | null) => {
                        if (nodeId === null) {
                            return
                        }

                        console.log(`connected to local node ID ${nodeId}`)
                        window.webContents.send("chat.connected", {
                            address: `/ip4/127.0.0.1/tcp/${nodePort}/p2p/${nodeId}`,
                            id: nodeId,
                            nickname: connectNickname,
                            currentRoomName: connectRoomName,
                        } as LocalNodeInfo)
                    })
                    .catch((err) => {
                        dialog.showErrorBox("Error", err.toString())
                    })
            })
        },
    )

    ipcMain.on("chat.send", (_e, msg: string, roomName: string) => {
        const request = new SendMessageRequest()
        request.setRoomName(roomName)
        request.setValue(msg)

        state.apiClient?.sendMessage(request, (err, res) => {
            if (err !== null) {
                console.error("failed sending message", err)
            }
        })
    })
})

app.on("window-all-closed", () => {
    app.quit()
})
app.on("before-quit", () => {
    state.close()
})
