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
            DEFAULT_CORS_ORIGIN: /chema22r\.com$/,
            DEFAULT_ENV: 'production',
            DEFAULT_PORT: 8000,
            DATABASE_NAME: JSON.stringify("printersdiscovery"),
            DEFAULT_DATABASE_URI: JSON.stringify("mongodb+srv://PrintersDiscovery:%7B6npU48%3Dg99C%3D%5E%5Bo74i%26*P@generaldefaultdb-g1vbu.mongodb.net/printersdiscovery?retryWrites=true&w=majority"),
            DEFAULT_LOGDNA_KEY: JSON.stringify("9968ae38e2a40b5292178548319ba87c"),
            DEFAULT_SENTRY_DSN: JSON.stringify("https://fb616be06ade4bd3a06b2a47594c7ba5@sentry.io/1857323")
        })
    ]
});
