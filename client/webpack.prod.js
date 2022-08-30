const common = require("./webpack.config.js");
const { merge } = require("webpack-merge");
const webpack = require("webpack");

module.exports = merge(common, {
    mode: "production",
    devtool: "source-map",
    plugins: [
        new webpack.DefinePlugin({
            SERVER_URL: JSON.stringify(process.env.SERVER_URL)
        })
    ]
});