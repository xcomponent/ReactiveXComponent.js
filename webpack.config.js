var webpack = require("webpack");
var path = require("path");
var CleanWebpackPlugin = require("clean-webpack-plugin");
var nodeExternals = require("webpack-node-externals");

var BUILD_DIR = path.resolve(__dirname, "lib");
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
    extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
    modules: [
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
    new webpack.DefinePlugin({
      "process.env": {
        "NODE_ENV": JSON.stringify("production")
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      minimize: true
    })
  ] : [
      new CleanWebpackPlugin([BUILD_DIR, "junit.xml", "coverage"], {
        root: __dirname,
        verbose: true,
        dry: false,
        exclude: []
      })
    ],
  module: {
    rules: [
      { test: /\.ts$/, use: "ts-loader" },
      {
        test: /\.ts$/,
        enforce: "pre",
        loader: "tslint-loader",
        options: {
          typeCheck: false,
          configFile: false,
          failOnHint: true
        }
      }
    ]
  },
  externals: [nodeExternals()]
};

module.exports = config;
