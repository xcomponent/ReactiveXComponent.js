var webpack = require("webpack");
var path = require("path");
var CleanWebpackPlugin = require("clean-webpack-plugin");
var nodeExternals = require("webpack-node-externals");

var BUILD_DIR = path.resolve(__dirname, "lib");
var APP_DIR = path.resolve(__dirname, "src");

var configClient = {
  entry: ["babel-polyfill", APP_DIR + "/index.ts"],
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
      "src",
    ]
  },
  node: {
    fs: "empty",
    net: "empty",
    tls: "empty"
  },
  plugins: process.env.NODE_ENV === "production" ? [
    new CleanWebpackPlugin([BUILD_DIR, "test_output", "coverage"], {
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
      new CleanWebpackPlugin([BUILD_DIR, "test_output", "coverage"], {
        root: __dirname,
        verbose: true,
        dry: false,
        exclude: []
      })
    ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        enforce: "pre",
        loader: "tslint-loader",
        options: {
          typeCheck: false,
          configFile: false,
          failOnHint: true
        }
      },
      {
        test: /\.(tsx|ts)$/,
        loader: "ts-loader",
        exclude: "/node_modules/"
      }]
  },
  externals: [
    (context, request, callback) => {
      if (/^ws$/.test(request)) {
        return callback(null, "commonjs" + request);
      }
      callback();
    }
  ]
};

var configServer = {
  entry: ["babel-polyfill", APP_DIR + "/index.ts"],
  devtool: "cheap-module-source-map",
  target: "node",
  output: {
    path: BUILD_DIR,
    filename: "xcomponentapi.node.js",
    publicPath: "/",
    libraryTarget: "umd",
    library: "xcomponentapi",
  },
  resolve: {
    extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
    modules: [
      "node_modules",
      "src",
    ]
  },
  plugins: process.env.NODE_ENV === "production" ? [
    new CleanWebpackPlugin([BUILD_DIR, "test_output", "coverage"], {
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
      new CleanWebpackPlugin([BUILD_DIR, "test_output", "coverage"], {
        root: __dirname,
        verbose: true,
        dry: false,
        exclude: []
      })
    ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        enforce: "pre",
        loader: "tslint-loader",
        options: {
          typeCheck: false,
          configFile: false,
          failOnHint: true
        }
      },
      {
        test: /\.(tsx|ts)$/,
        loader: "ts-loader",
        exclude: "/node_modules/"
      }]
  },
  externals: [nodeExternals()]
};


module.exports = [configServer, configClient];