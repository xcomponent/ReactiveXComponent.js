
requirejs.config({
    urlArgs: 'bustCache=' + (new Date()).getTime(),
    baseUrl: '../src',

    callback: function () {
        "use strict";

        require(["XComponentAPI"], function (XComponentAPI) {
            
            var url = "wss://localhost:443";
            var factory = new XComponentAPI.Factory();
            var api = factory.createXComponentApi(url)

            var jsonMessage = { "Name": "HAZEM CHAMPION" };
            var componentName = "HelloWorld";
            var stateMachineName = "HelloWorldManager";

            api.send(componentName, stateMachineName, jsonMessage);

        });

    }
});
