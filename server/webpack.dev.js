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
            DEFAULT_ENV: 'development',
            DEFAULT_PORT: 8000,
            DATABASE_NAME: JSON.stringify("printersdiscovery"),
            DEFAULT_DATABASE_URI: JSON.stringify("mongodb://localhost/printersdiscovery"),
            DEFAULT_LOGDNA_KEY: JSON.stringify("9968ae38e2a40b5292178548319ba87c"),
            DEFAULT_SENTRY_DSN: JSON.stringify("https://fb616be06ade4bd3a06b2a47594c7ba5@sentry.io/1857323")
        }),
        new NodemonPlugin()
    ]
});
