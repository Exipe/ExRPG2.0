
module.exports = {

    mode: "production",

    output: {
        path: __dirname + "/app",
        filename: 'release.js'
    },

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

}