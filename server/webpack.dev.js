const common = require("./webpack.config.js");
const dotenv = require('dotenv').config().parsed;
const { merge } = require("webpack-merge");
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
            DEFAULT_ENV: JSON.stringify("development"),
            DEFAULT_PORT: 8000,
            DATABASE_NAME: JSON.stringify("printersdiscovery"),
            DEFAULT_DATABASE_URI: JSON.stringify("mongodb://127.0.0.1/printersdiscovery"),
            DEFAULT_LOGDNA_KEY: JSON.stringify(dotenv.PRINTERS_DISCOVERY_LOGDNA_KEY),
            DEFAULT_SENTRY_DSN: JSON.stringify(dotenv.PRINTERS_DISCOVERY_SENTRY_DSN)
        }),
        new NodemonPlugin()
    ]
});
