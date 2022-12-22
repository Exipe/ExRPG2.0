const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    mode: "development",

    devtool: "source-map",

    devServer: {
        historyApiFallback: true,
    },

    output: {
        path: __dirname + "/app",
        filename: 'script.js'
    },

    plugins: [
        new webpack.DefinePlugin({
            "__PROTOCOL__": JSON.stringify("ws"),
            "__ADDRESS__": JSON.stringify("localhost"),
            "__PORT__": JSON.stringify(80)
        }),
		new MiniCssExtractPlugin({
			filename: "style.css"
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
            },
			{
				test: /\.s[ac]ss$/i,
				use: [
				  MiniCssExtractPlugin.loader,
				  "css-loader",
				  "sass-loader",
				],
			},
        ],
    },

}