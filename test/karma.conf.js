// Karma configuration
var webpack = require('webpack');

module.exports = function (config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [      
      'test/spec/*Spec.js'
    ],

    // list of files to exclude
    exclude: [
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/spec/*Spec.js': ['webpack', 'sourcemap']
    },

    webpack: {
      devtool: 'inline-source-map',
      externals: {
        'websocket': 'websocket',
        'xmldoc': 'xmldoc'
      },
      resolve: {
        modulesDirectories: [
          'node_modules',
          'src']
      },
      module: {
        loaders: [
          { test: /\.js$/, loader: 'babel-loader' }
        ],
        postLoaders: [{ //delays coverage til after tests are run, fixing transpiled source coverage error
          test: /\.js$/,
          exclude: /(test|node_modules|bower_components)\//,
          loader: 'istanbul-instrumenter'
        }]
      }
    },

    webpackMiddleware: {
      stats: 'errors-only'
    },

    webpackServer: {
      noInfo: true //please don't spam the console when running in karma!
    },

    plugins: [
      require("karma-webpack"),
      require("karma-coverage"),
      require("karma-junit-reporter"),
      require("karma-jasmine"),
      require("karma-chrome-launcher"),
      require("karma-sourcemap-loader")
    ],

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['junit', 'progress', 'dots', 'coverage'],

    junitReporter : {
      outputDir: 'test_out',
      outputFile: 'unit-tests-results.xml',
      suite: 'unit'
    },

    coverageReporter: {
      reporters: [
        { type: 'html', dir: 'coverage/html' },
        { type: 'cobertura', dir: 'coverage/cobertura' }
      ]
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
