define(["configuration/xcomponentConfiguration"], function (XComponentConfiguration) {
	"use strict"


	var Publisher = function (webSocket) {
	    this.webSocket = webSocket;
	}


    Publisher.prototype.getEventToSend = function (componentName, stateMachineName, jsonMessage) {
        var codes = XComponentConfiguration.getParser().getCodes(componentName, stateMachineName);
        var publish = XComponentConfiguration.getParser().getPublishDetails(codes.componentCode, codes.stateMachineCode);

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
        this.webSocket.send(getStringToSend(data));
    }


    function getStringToSend(data) {
        var stringToSend = data.routingKey + " " + data.event.Header.ComponentCode.Fields[0]
                    + " " + JSON.stringify(data.event);
        return stringToSend;
    }


    return Publisher;
});
