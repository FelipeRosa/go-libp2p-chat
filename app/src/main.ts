import { app, BrowserWindow, Menu } from "electron"

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
})

app.on("window-all-closed", () => {
    app.quit()
})
