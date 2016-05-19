var allTestFiles = [];
var TEST_REGEXP = /(spec|test)\.js$/i;

var pathToModule = function (path) {
    var returnValue = path.replace(/^\/base\//, '').replace(/\.js$/, '');
    return returnValue;
};

Object.keys(window.__karma__.files).forEach(function (file) {
    if (TEST_REGEXP.test(file)) {
        // Normalize paths to RequireJS module names.
        allTestFiles.push(pathToModule(file));
    }
});

require.config({
    // Karma serves files under /base, which is the basePath from your config file
    // note we are using base/src to ensure that modules are defined relative to the same path
    // for both main.js and test-main.js requireJS bootstraps
    baseUrl: '/base/src',

    paths: {
        //'jquery': '../node_modules/jquery/dist/jquery',
        'test': '../test'
    },

    // dynamically load all test files
    deps: allTestFiles,

    // we have to kickoff jasmine, as it is asynchronous
    callback: window.__karma__.start
});
