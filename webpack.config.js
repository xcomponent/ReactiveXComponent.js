var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'dist/');
var APP_DIR = path.resolve(__dirname, 'src');

var config = {
  entry: APP_DIR + '/index.js',
  output: {
    path: BUILD_DIR,
    filename: 'xcomponentapi.js',
    libraryTarget: 'umd',
    library: 'xcomponentapi',    
    publicPath: './'
  },
  module : {
    loaders : []
  },
  externals: {
    'websocket': 'websocket',
    'xmldoc': 'xmldoc'
  }
};

module.exports = config;