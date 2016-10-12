define(function () {
	"use strict"

	var Publisher = function (webSocket, configuration) {
	    this.webSocket = webSocket;
	    this.configuration = configuration;
	}


	Publisher.prototype.getEventToSend = function (componentName, stateMachineName, messageType, jsonMessage) {
        var codes = this.configuration.getCodes(componentName, stateMachineName);
        var headerConfig = this.getHeaderConfig(codes.componentCode, codes.stateMachineCode, messageType);
        var event = {
            "Header": headerConfig.header,
            "JsonMessage": JSON.stringify(jsonMessage)
        };
        return {
            event: event,
            routingKey: headerConfig.routingKey
        };
    }


	Publisher.prototype.canPublish = function (componentName, stateMachineName, messageType) {
	    try {
	        var codes = this.configuration.getCodes(componentName, stateMachineName);
	        this.configuration.getPublisherDetails(codes.componentCode, codes.stateMachineCode, messageType);
	        return true;
	    } catch (e) {
	        return false;
	    }
	}


    Publisher.prototype.send = function (componentName, stateMachineName, messageType, jsonMessage) {
        var data = this.getEventToSend(componentName, stateMachineName, messageType, jsonMessage);
        this.webSocket.send(convertToWebsocketInputFormat(data));
    }
    
    
    Publisher.prototype.sendWithStateMachineRef = function (stateMachineRef, messageType, jsonMessage) {
        var componentCode = stateMachineRef.ComponentCode.Fields[0];
        var stateMachineCode = stateMachineRef.StateMachineCode.Fields[0];
        var headerConfig = this.getHeaderConfig(componentCode, stateMachineCode, messageType);
        var headerStateMachineRef = {
            "StateMachineId": stateMachineRef.StateMachineId,
            "AgentId": stateMachineRef.AgentId
        };
        var event = {
            "Header": mergeJsonObjects(headerStateMachineRef, headerConfig.header),
            "JsonMessage": JSON.stringify(jsonMessage)
        };
        var dataToSend = {
            event: event,
            routingKey: headerConfig.routingKey
        };
        var webSocketInputFormat = convertToWebsocketInputFormat(dataToSend);
        this.webSocket.send(webSocketInputFormat);
    }


    Publisher.prototype.getHeaderConfig = function (componentCode, stateMachineCode, messageType) {
        var publisher = this.configuration.getPublisherDetails(componentCode, stateMachineCode, messageType);
        var header = {
            "StateMachineCode": { "Case": "Some", "Fields": [parseInt(stateMachineCode)] },
            "ComponentCode": { "Case": "Some", "Fields": [parseInt(componentCode)] },
            "EventCode": parseInt(publisher.eventCode),
            "IncomingType": 0,
            "MessageType": { "Case": "Some", "Fields": [messageType] }
        };
        return {
            header: header,
            routingKey: publisher.routingKey
        }
    }


    var convertToWebsocketInputFormat = function (data) {
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
