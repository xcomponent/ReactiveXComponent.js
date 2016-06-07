define(function () {
	"use strict"

	var Publisher = function (webSocket, configuration) {
	    this.webSocket = webSocket;
	    this.configuration = configuration;
	}


    Publisher.prototype.getEventToSend = function (componentName, stateMachineName, jsonMessage) {
        var codes = this.configuration.getCodes(componentName, stateMachineName);
        var eventWithoutStateMachineRef = this.configuration.getEventWithoutStateMachineRef(codes.componentCode, codes.stateMachineCode);
        var event = {
            "Header": eventWithoutStateMachineRef.header,
            "JsonMessage": JSON.stringify(jsonMessage)
        };
        return {
            event: event,
            routingKey: eventWithoutStateMachineRef.routingKey
        };
    }


    Publisher.prototype.send = function(componentName, stateMachineName, jsonMessage) {
        var data = this.getEventToSend(componentName, stateMachineName, jsonMessage);
        this.webSocket.send(this.configuration.convertToWebsocketInputFormat(data));
    }
    
    
    return Publisher;
});
