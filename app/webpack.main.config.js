const path = require("path")

module.exports = {
    mode: "development",
    entry: "./src/main/index.ts",
    target: "electron-main",
    resolve: {
        extensions: [".js", ".ts"],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "build"),
    },
}