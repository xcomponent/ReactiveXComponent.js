define(function () {
	"use strict"

	var Publisher = function (webSocket, configuration) {
	    this.webSocket = webSocket;
	    this.configuration = configuration;
	}


    Publisher.prototype.getEventToSend = function (componentName, stateMachineName, jsonMessage) {
        var codes = this.configuration.getCodes(componentName, stateMachineName);
        var eventWithoutStateMachineRef = this.getEventWithoutStateMachineRef(codes.componentCode, codes.stateMachineCode);
        var event = {
            "Header": eventWithoutStateMachineRef.header,
            "JsonMessage": JSON.stringify(jsonMessage)
        };
        return {
            event: event,
            routingKey: eventWithoutStateMachineRef.routingKey
        };
    }


    Publisher.prototype.getEventWithoutStateMachineRef = function (componentCode, stateMachineCode) {
        var publisher = this.configuration.getPublisherDetails(componentCode, stateMachineCode);
        var header = {
            "StateMachineCode": { "Case": "Some", "Fields": [parseInt(stateMachineCode)] },
            "ComponentCode": { "Case": "Some", "Fields": [parseInt(componentCode)] },
            "EventCode": parseInt(publisher.eventCode),
            "IncomingType": 0,
            "MessageType": { "Case": "Some", "Fields": [publisher.messageType] }
        };
        return {
            header: header,
            routingKey: publisher.routingKey
        }
    }


    Publisher.prototype.send = function(componentName, stateMachineName, jsonMessage) {
        var data = this.getEventToSend(componentName, stateMachineName, jsonMessage);
        this.webSocket.send(convertToWebsocketInputFormat(data));
    }
    

    Publisher.prototype.getEventToSendUsingStateMachineRef = function (stateMachineRef, jsonMessage) {
        var componentCode = stateMachineRef.ComponentCode.Fields[0];
        var stateMachineCode = stateMachineRef.StateMachineCode.Fields[0];
        var eventWithoutStateMachineRef = this.getEventWithoutStateMachineRef(componentCode, stateMachineCode);
        var headerStateMachineRef = {
            "AgentId": stateMachineRef.AgentId,
            "StateMachineId": stateMachineRef.StateMachineId,
        };
        return {
            event: {
                "Header": mergeJsonObjects(headerStateMachineRef, eventWithoutStateMachineRef.header),
                "JsonMessage": JSON.stringify(jsonMessage)
            },
            routingKey: eventWithoutStateMachineRef.routingKey
        };
    }


    Publisher.prototype.sendStatemachineRef = function (stateMachineRef, jsonMessage) {
        var data = this.getEventToSendUsingStateMachineRef(stateMachineRef, jsonMessage);
        this.webSocket.send(convertToWebsocketInputFormat(data));
    }


    function convertToWebsocketInputFormat(data) {
        var input = data.routingKey + " " + data.event.Header.ComponentCode.Fields[0]
                    + " " + JSON.stringify(data.event);
        return input;
    }


    var mergeJsonObjects = function (obj1, obj2) {
        var merged = {};
        for (var key in obj1)
            merged[key] = obj1[key];
        for (var key in obj2)
            merged[key] = obj2[key];
        return merged;
    }


    return Publisher;
});
