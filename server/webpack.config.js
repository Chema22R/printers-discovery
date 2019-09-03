const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    target: "node",
    entry: {
        index: "./src/index.js"
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist")
    },
    plugins: [
        new CopyWebpackPlugin([
            {from: "./src/HPDiscovery", to: "HPDiscovery"}
        ])
    ]
};