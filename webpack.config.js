var webpack = require("webpack");
var path = require("path");
var CleanWebpackPlugin = require("clean-webpack-plugin");

var BUILD_DIR = path.resolve(__dirname, "dist");
var APP_DIR = path.resolve(__dirname, "src");

var config = {
  entry: ["es6-shim", APP_DIR + "/index.ts"],
  devtool: "cheap-module-source-map",
  output: {
    path: BUILD_DIR,
    filename: "xcomponentapi.js",
    publicPath: "/",
    libraryTarget: "umd",
    library: "xcomponentapi",
  },
  resolve: {
    extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
    modulesDirectories: [
      "node_modules",
      "src"]
  },
  plugins: process.env.NODE_ENV === "production" ? [
    new CleanWebpackPlugin([BUILD_DIR, "junit.xml", "coverage"], {
      root: __dirname,
      verbose: true,
      dry: false,
      exclude: []
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
      "process.env": {
        "NODE_ENV": JSON.stringify("production")
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    })
  ] : [
      new CleanWebpackPlugin([BUILD_DIR, "junit.xml", "coverage"], {
        root: __dirname,
        verbose: true,
        dry: false,
        exclude: []
      }),
    ],
  module: {
    loaders: [
      { test: /\.ts$/, loader: "awesome-typescript-loader" },
    ],
    preLoaders: [
      {
        test: /\.ts$/,
        loader: "tslint-loader"
      }
    ]
  },
  tslint: {
    typeCheck: false,
    configFile: false,
    failOnHint: true
  },
  externals: {
    "websocket": "websocket",
    "xmldoc": "xmldoc"
  }
};

module.exports = config;