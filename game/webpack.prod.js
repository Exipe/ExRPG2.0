const webpack = require("webpack");

module.exports = (env) => ({
    mode: "production",

    output: {
        path: __dirname + "/app",
        filename: 'script.js'
    },

    plugins: [
        new webpack.DefinePlugin({
            "__PROTOCOL__": JSON.stringify(env.PROTOCOL),
            "__ADDRESS__": JSON.stringify(env.ADDRESS),
            "__PORT__": JSON.stringify(env.PORT)
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
        ]
    },

    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    }

});