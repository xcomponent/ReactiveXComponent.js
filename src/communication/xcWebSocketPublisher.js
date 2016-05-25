define(["configuration/xcConfiguration"], function (XComponentConfiguration) {
	"use strict"

	var Publisher = function (webSocket, configuration) {
	    this.webSocket = webSocket;
	    this.configuration = configuration;
	}


    Publisher.prototype.getEventToSend = function (componentName, stateMachineName, jsonMessage) {
        var codes = this.configuration.getCodes(componentName, stateMachineName);
        var publish = this.configuration.getPublisherDetails(codes.componentCode, codes.stateMachineCode);

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
        return {
            event: event,
            routingKey: publish.routingKey
        };
    }


    Publisher.prototype.send = function(componentName, stateMachineName, jsonMessage) {
        var data = this.getEventToSend(componentName, stateMachineName, jsonMessage);
        this.webSocket.send(convertToWebsocketInputFormat(data));
    }


    function convertToWebsocketInputFormat(data) {
        var stringToSend = data.routingKey + " " + data.event.Header.ComponentCode.Fields[0]
                    + " " + JSON.stringify(data.event);
        return stringToSend;
    }


    return Publisher;
});
