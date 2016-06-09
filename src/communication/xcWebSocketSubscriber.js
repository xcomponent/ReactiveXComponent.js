define(["rx"], function (Rx) {
	"use strict"

	var Subscriber = function (webSocket, configuration, replyPublisher) {
	    this.webSocket = webSocket;
	    this.configuration = configuration;
	    this.replyPublisher = replyPublisher;
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
	        "StateMachineId": jsonData.Header.StateMachineId,
	        "AgentId": jsonData.Header.AgentId,
	        "StateMachineCode": jsonData.Header.StateMachineCode,
	        "ComponentCode": jsonData.Header.ComponentCode,
	        "send": function (messageType, jsonMessage) {
	            thisObject.replyPublisher.sendWithStateMachineRef(this, messageType, jsonMessage);
	        }
	    };
	    return {
	        stateMachineRef: stateMachineRef,
	        jsonMessage: jsonData.JsonMessage
	    };
	}


    function convertToWebsocketInputFormat(data) {
        var input = "subscribe " + JSON.stringify(data);
        return input;
    }


    return Subscriber;
});
