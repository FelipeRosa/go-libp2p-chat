const HtmlWebpackPlugin = require("html-webpack-plugin")
const path = require("path")

module.exports = {
    mode: "development",
    entry: "./src/renderer/index.tsx",
    target: "electron-renderer",
    resolve: {
        extensions: [".js", ".ts", ".tsx"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./template.html",
        }),
    ],
    output: {
        filename: "renderer.js",
        path: path.resolve(__dirname, "build"),
    },
}
