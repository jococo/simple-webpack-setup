var WebpackOnBuildPlugin = require('on-build-webpack');
var exec = require('child_process').exec;
var cmd;

const plugins = [
    new WebpackOnBuildPlugin(function(stats) {
        cmd = `node_modules/.bin/mocha dist/test.js`;

        exec(cmd, (err, stdout, stderr) => {
            console.log(err);
            console.log(stdout);
            console.log(stderr);
        })
    })
]

module.exports = {
    entry: {
        index: './src/index.ts',
        test: './src/test.ts'
    },
    target: "node",
    output: {
        filename: '[name].js',
        path: __dirname + '/dist'
    },
    devtool: 'source-map',
    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: 'ts-loader',
            exclude: /node_modules/,
        }]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    plugins: plugins,
    externals: {
        mocha: "commonjs mocha",
        chai: "commonjs chai"
    }
};