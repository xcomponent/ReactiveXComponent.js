
define(["Connection", "Parser", "GetterXcApi"], function (Connection, Parser, GetterXcApi) {
    "use strict";

    var Factory = function () {
        this.createXComponentApi = function (url) {
            var xcApiString = GetterXcApi.Getter();
            var parser = new Parser(xcApiString);
            var factoryConnection = new Connection.Factory();
            var connection = factoryConnection.createConnection(url);
            var api = new XComponentAPI(connection, parser);
            return api;
        }
    }


    var XComponentAPI = function(connection, parser) {

        var _connection = connection;

        this.getConnection = function () {
            return _connection;
        }

        var _parser = parser;

        this.getParser = function () {
            return _parser;
        }

    }
    
    
    XComponentAPI.prototype.getEventToSend = function (componentName, stateMachineName, jsonMessage) {
        var codes = this.getParser().getCodes(componentName, stateMachineName);
        var publish = this.getParser().getPublish(codes.componentCode, codes.stateMachineCode);

        var event = {
            "Header": {
                "StateMachineCode": { "Case": "Some", "Fields": [parseInt(codes.stateMachineCode)] },
                "ComponentCode": { "Case": "Some", "Fields": [parseInt(codes.componentCode)] },
                "EventCode": parseInt(publish.eventCode),
                "IncomingType": 0,
                "MessageType": { "Case": "Some", "Fields": [publish.messageType] }
            },
            "JsonMessage": JSON.stringify(jsonMessage)
        };
        return { event: event, routingKey: publish.routingKey }
    }


    XComponentAPI.prototype.send = function (componentName, stateMachineName, jsonMessage) {
        try {
            var connection = this.getConnection();
            var data = this.getEventToSend(componentName, stateMachineName, jsonMessage);
            var stringToSend = data.routingKey + " " + data.event.Header.ComponentCode.Fields[0]
                                + " " + JSON.stringify(data.event);
            connection.send(stringToSend);
            return true;
        } catch (err) {
            console.error("Error while sending message\n" + err);
            return false;
        }
    }
  
    return {
        Factory: Factory,
        Init: XComponentAPI
    };
});
