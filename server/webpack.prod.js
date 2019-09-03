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
            DEFAULT_DATABASE_URI: JSON.stringify("mongodb+srv://PrintersDiscovery:C%7B%5B%3D%2B(kb77x44on%256%404s4P@generaldefaultdb-g1vbu.mongodb.net/printersdiscovery?retryWrites=true&w=majority")
        })
    ]
});