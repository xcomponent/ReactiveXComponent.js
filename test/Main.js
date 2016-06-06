
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

            var jsonMessage1 = { "Name": "Test1" };
            var jsonMessage2 = { "Name": "Test2" };

            var componentName = "HelloWorld";
            var stateMachineName = "HelloWorldManager";
            var stateMachineResponse = "HelloWorldResponse";

            var sessionListener = function (error, session) {
                if (error) {
                    console.log(error);
                    return;
                }
                var publisher = session.createPublisher();
                publisher.send(componentName, stateMachineName, jsonMessage1);

                var subscriber = session.createSubscriber();
                var i = 0;
                var stateMachineUpdateListener = function (jsonData) {
                    console.log(jsonData);
                    if (i == 0) {
                        publisher.sendStatemachineRef(jsonData.stateMachineRef, jsonMessage2);
                        i++;
                    }
                }
                subscriber.subscribe(componentName, stateMachineResponse, stateMachineUpdateListener);
            }

            var api = new XComponentAPI();
            api.createSession(serverUrl, sessionListener);

        });

    }
});
