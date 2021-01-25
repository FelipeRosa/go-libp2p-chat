const createDmg = require("electron-installer-dmg")
const path = require("path")

createDmg({
    appPath: "dist/libp2p-chat-darwin-x64",
    name: "libp2p-chat",
    title: "libp2p-chat",
    out: "dist",
    overwrite: true,
    contents: (opts) => {
        return [
            { x: 448, y: 344, type: "link", path: "/Applications" },
            {
                x: 192,
                y: 344,
                type: "file",
                path: path.join(opts.appPath, "libp2p-chat.app"),
            },
        ]
    },
})
