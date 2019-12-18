const webpack = require('webpack');
const path = require('path');
const BUILD_DIR = path.resolve(__dirname, 'lib');
const APP_DIR = path.resolve(__dirname, 'src');

const entry = [APP_DIR + '/index.ts'];
const devtool = 'cheap-module-source-map';
const resolve = {
    extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
    modules: ['node_modules', 'src']
};
const plugins =
    process.env.NODE_ENV === 'production'
        ? [
              new webpack.DefinePlugin({
                  'process.env': {
                      NODE_ENV: JSON.stringify('production')
                  }
              }),
              new webpack.optimize.UglifyJsPlugin({
                  sourceMap: true,
                  minimize: true
              })
          ]
        : [];
const moduleConfig = {
    rules: [
        {
            test: /\.ts$/,
            enforce: 'pre',
            loader: 'tslint-loader',
            options: {
                typeCheck: false,
                configFile: false,
                failOnHint: true
            }
        },
        {
            test: /\.(tsx|ts)$/,
            loader: 'ts-loader',
            exclude: '/node_modules/'
        }
    ]
};

const configAll = {
    entry: entry,
    devtool: devtool,
    output: {
        path: BUILD_DIR,
        filename: 'xcomponentapi.all.js',
        publicPath: '/',
        libraryTarget: 'umd',
        library: 'xcomponentapi'
    },
    resolve: resolve,
    plugins: plugins,
    module: moduleConfig
};

const config = {
    entry: entry,
    devtool: devtool,
    target: 'node',
    output: {
        path: BUILD_DIR,
        filename: 'xcomponentapi.js',
        publicPath: '/',
        libraryTarget: 'umd',
        library: 'xcomponentapi'
    },
    resolve: resolve,
    plugins: plugins,
    module: moduleConfig
};

module.exports = [configAll, config];
