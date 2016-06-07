define(["rx"], function (Rx) {
	"use strict"

	var Subscriber = function (webSocket, configuration) {
	    this.webSocket = webSocket;
	    this.configuration = configuration;
	    this.observableMsg = Rx.Observable.fromEvent(this.webSocket, 'message');
	}


	Subscriber.prototype.getStateMachineUpdates = function (componentName, stateMachineName) {
	    var codes = this.configuration.getCodes(componentName, stateMachineName);
	    var thisObject = this;
	    var filteredObservable = this.observableMsg
            .map(function (e) {
                return thisObject.getJsonDataFromEvent(e);
            })
            .filter(function (jsonData) {
                return isSameComponent(jsonData, codes) && isSameStateMachine(jsonData, codes);
            })
	    return filteredObservable;
	}


	Subscriber.prototype.subscribe = function (componentName, stateMachineName, stateMachineUpdateListener) {
	    this.getStateMachineUpdates(componentName, stateMachineName)
            .subscribe(function (jsonData) {
                stateMachineUpdateListener(jsonData);
            });
	    var topic = this.configuration.getSubscriberTopic(componentName, stateMachineName);
	    var data = {
	        "Header": { "IncomingType": 0 },
	        "JsonMessage": JSON.stringify({ "Topic": { "Key": topic } })
	    };
	    this.webSocket.send(convertToWebsocketInputFormat(data));
    }


	function isSameComponent(jsonData, codes) {
	    var sameComponent = jsonData.stateMachineRef.ComponentCode.Fields[0] == parseInt(codes.componentCode);
	    return sameComponent;
	}


	function isSameStateMachine(jsonData, codes) {
	    var sameStateMachine = jsonData.stateMachineRef.StateMachineCode.Fields[0] == parseInt(codes.stateMachineCode);
	    return sameStateMachine;
	}


	Subscriber.prototype.getJsonDataFromEvent = function (e) {
	    var jsonData = JSON.parse(e.data.substring(e.data.indexOf("{"), e.data.lastIndexOf("}") + 1));
	    var thisObject = this;
	    var stateMachineRef = {
	        "StateMachineCode": jsonData.Header.StateMachineCode,
	        "ComponentCode": jsonData.Header.ComponentCode,
	        "send": function (jsonMessage) {
	            thisObject.sendWithStateMachineRef(jsonData, jsonMessage);
	        }
	    };
	    return {
	        stateMachineRef: stateMachineRef,
	        jsonMessage: jsonData.JsonMessage
	    };
	}


	Subscriber.prototype.sendWithStateMachineRef = function (jsonData, jsonMessage) {
	    var componentCode = jsonData.Header.ComponentCode.Fields[0];
	    var stateMachineCode = jsonData.Header.StateMachineCode.Fields[0];
	    var eventWithoutStateMachineRef = this.configuration.getEventWithoutStateMachineRef(componentCode, stateMachineCode);
	    var headerStateMachineRef = {
	        "StateMachineId": jsonData.Header.StateMachineId,
	        "AgentId": jsonData.Header.AgentId
	    };
	    var event = {
	        "Header": mergeJsonObjects(headerStateMachineRef, eventWithoutStateMachineRef.header),
	        "JsonMessage": JSON.stringify(jsonMessage)
	    };
	    var dataToSend = {
	        event: event,
	        routingKey: eventWithoutStateMachineRef.routingKey
	    };
	    var webSocketInputFormat = this.configuration.convertToWebsocketInputFormat(dataToSend);
	    this.webSocket.send(webSocketInputFormat);
	}


	var mergeJsonObjects = function (obj1, obj2) {
	    var merged = {};
	    for (var key in obj1)
	        merged[key] = obj1[key];
	    for (var key in obj2)
	        merged[key] = obj2[key];
	    return merged;
	}


    function convertToWebsocketInputFormat(data) {
        var input = "subscribe " + JSON.stringify(data);
        return input;
    }


    return Subscriber;
});
