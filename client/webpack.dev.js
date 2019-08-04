const common = require("./webpack.config.js");
const merge = require("webpack-merge");
const webpack = require("webpack");

module.exports = merge(common, {
    mode: "development",
    devtool: "inline-source-map",
    devServer: {
        contentBase: "./dist"
    },
    plugins: [
        new webpack.DefinePlugin({
            SERVER_URL: JSON.stringify("http://localhost:8084")
        })
    ]
});