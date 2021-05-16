const common = require("./webpack.config.js");
const { merge } = require("webpack-merge");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpack = require("webpack");

module.exports = merge(common, {
    mode: "production",
    devtool: "source-map",
    plugins: [
        new CleanWebpackPlugin(),
        new webpack.DefinePlugin({
            DEFAULT_CORS_ORIGIN: JSON.stringify(process.env.PRINTERS_DISCOVERY_CORS_ORIGIN),
            DEFAULT_ENV: JSON.stringify("production"),
            DEFAULT_PORT: 8000,
            DATABASE_NAME: JSON.stringify("printersdiscovery"),
            DEFAULT_DATABASE_URI: JSON.stringify(process.env.PRINTERS_DISCOVERY_DATABASE_URI),
            DEFAULT_LOGDNA_KEY: JSON.stringify(process.env.PRINTERS_DISCOVERY_LOGDNA_KEY),
            DEFAULT_SENTRY_DSN: JSON.stringify(process.env.PRINTERS_DISCOVERY_SENTRY_DSN)
        })
    ]
});
