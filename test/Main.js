
requirejs.config({
    urlArgs: 'bustCache=' + (new Date()).getTime(),
    baseUrl: '../src',

    paths: {
        'rx': '../node_modules/rx/dist/rx.all'
    },

    callback: function () {
        "use strict";

        require(["xcomponentAPI"], function (XComponentAPI) {
            
            var serverUrl = "wss://localhost:443";

            var jsonMessage1 = { "Name": "HAZEM CHAMPION " };
            var jsonMessage2 = { "Name": "HAZEM CHAMPION " };
            var jsonMessage3 = { "Name": "HAZEM GAGNEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE " };

            var componentName = "HelloWorld";
            var stateMachineName = "HelloWorldManager";

            var callback = function(session) {
                session.send(componentName, stateMachineName, jsonMessage1);
                session.send(componentName, stateMachineName, jsonMessage2);
                session.send(componentName, stateMachineName, jsonMessage3);
            }

            var callbackError = function(e) {
                console.log("Exec callback error!!!");
            }

            XComponentAPI.create(serverUrl, callback, callbackError);

        });

    }
});
