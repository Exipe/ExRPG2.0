const webpack = require("webpack");

module.exports = {
    mode: "development",

    devtool: "source-map",

    output: {
        path: __dirname + "/app",
        filename: 'script.js'
    },

    plugins: [
        new webpack.DefinePlugin({
            "__PROTOCOL__": JSON.stringify("ws"),
            "__ADDRESS__": JSON.stringify("localhost"),
            "__PORT__": JSON.stringify(80)
        })
    ],

    resolve: {
        extensions: [".js", ".ts", ".tsx"]
    },

    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader"
                    }
                ]
            }
        ],
    },

}