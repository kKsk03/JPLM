const path = require('path');

module.exports = {
    devtool: "source-map",
    entry: {
        number_plate: './src/index.ts'
    },
    output: {
        path: path.join(__dirname, 'build'),
        publicPath: "/js/",
        filename: '[name].js'
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/, 
                loader: 'ts-loader'
            }
        ]
    },
    devServer: {
        contentBase: path.join(__dirname, 'web_root')
    }
}