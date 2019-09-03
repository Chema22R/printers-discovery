const common = require("./webpack.config.js");
const merge = require("webpack-merge");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpack = require("webpack");

module.exports = merge(common, {
    mode: "production",
    devtool: "source-map",
    plugins: [
        new CleanWebpackPlugin(),
        new webpack.DefinePlugin({
            DEFAULT_PORT: 8000,
            DEFAULT_DATABASE_URI: JSON.stringify("mongodb+srv://PrintersDiscovery:*G%3BCr%233%7B2E3c7kLo9%2B*3%3E8@printersdiscovery-yzbdm.mongodb.net/printersdiscovery?retryWrites=true&w=majority")
        })
    ]
});