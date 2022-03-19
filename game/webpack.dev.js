
module.exports = {

    mode: "development",

    devtool: "source-map",

    output: {
        path: __dirname + "/app",
        filename: 'script.js'
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

}