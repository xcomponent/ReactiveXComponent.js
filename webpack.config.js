var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'dist/');
var APP_DIR = path.resolve(__dirname, 'src');

var config = {
  entry: APP_DIR + '/index.js',
  devtool: 'cheap-module-source-map',
  output: {
    path: BUILD_DIR,
    filename: 'xcomponentapi.js',
    libraryTarget: 'umd',
    library: 'xcomponentapi',
    publicPath: './'
  },
  plugins: process.env.NODE_ENV === 'production' ? [    
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    })
  ] : [],
  module: {
    loaders: []
  },
  externals: {
    'websocket': 'websocket',
    'xmldoc': 'xmldoc'
  }
};

module.exports = config;