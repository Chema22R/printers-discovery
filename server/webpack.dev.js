const common = require("./webpack.config.js");
const merge = require("webpack-merge");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpack = require("webpack");

module.exports = merge(common, {
    mode: "development",
    devtool: "inline-source-map",
    plugins: [
        new CleanWebpackPlugin(),
        new webpack.DefinePlugin({
            SERVER_PORT: 8084,
            DATABASE_NAME: JSON.stringify("printersdiscovery"),
            DATABASE_URI: JSON.stringify("mongodb://localhost:27017")
        })
    ]
});