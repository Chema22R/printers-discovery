const common = require("./webpack.config.js");
const merge = require("webpack-merge");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpack = require("webpack");
const NodemonPlugin = require("nodemon-webpack-plugin");

module.exports = merge(common, {
    mode: "development",
    devtool: "inline-source-map",
    plugins: [
        new CleanWebpackPlugin(),
        new webpack.DefinePlugin({
            DEFAULT_CORS_ORIGIN: /localhost:8080$/,
            DEFAULT_PORT: 8000,
            DATABASE_NAME: JSON.stringify("printersdiscovery"),
            DEFAULT_DATABASE_URI: JSON.stringify("mongodb://localhost/printersdiscovery")
        }),
        new NodemonPlugin()
    ]
});