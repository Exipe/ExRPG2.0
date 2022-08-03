const webpack = require("webpack");

module.exports = (env) => ({
    mode: "production",

    output: {
        path: __dirname + "/public",
        filename: 'main.js'
    },

    resolve: {
        extensions: [".js", ".ts", ".tsx"]
    },

    plugins: [
        new webpack.DefinePlugin({
            "__RES_PATH__": JSON.stringify(env.RES_PATH)
        })
    ],

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
        ]
    },

});