define(["rx"], function (Rx) {
	"use strict"

	var Subscriber = function (webSocket, configuration, replyPublisher) {
	    this.webSocket = webSocket;
	    this.configuration = configuration;
	    this.replyPublisher = replyPublisher;
	    this.subscribedStateMachines = {};
	    this.observableMsg = Rx.Observable.fromEvent(this.webSocket, 'message');
	}


	Subscriber.prototype.getStateMachineUpdates = function (componentName, stateMachineName) {
	    var filteredObservable = this.prepareStateMachineUpdates(componentName, stateMachineName);
	    this.sendSubscribeRequest(componentName, stateMachineName);
	    return filteredObservable;
	}


	Subscriber.prototype.prepareStateMachineUpdates = function (componentName, stateMachineName) {
	    var codes = this.configuration.getCodes(componentName, stateMachineName);
	    var thisObject = this;
	    var filteredObservable = this.observableMsg
            .map(function (e) {
                return thisObject.getJsonDataFromEvent(e);
            })
            .filter(function (jsonData) {
                return isSameComponent(jsonData, codes) && isSameStateMachine(jsonData, codes);
            });
	    return filteredObservable;
	}


	Subscriber.prototype.subscribe = function (componentName, stateMachineName, stateMachineUpdateListener) {
	    this.prepareStateMachineUpdates(componentName, stateMachineName)
            .subscribe(function (jsonData) {
                stateMachineUpdateListener(jsonData);
            });
	    this.sendSubscribeRequest(componentName, stateMachineName);
    }


	Subscriber.prototype.sendSubscribeRequest = function (componentName, stateMachineName) {
	    if (!isSubscribed(this.subscribedStateMachines, componentName, stateMachineName)) {
	        var data = this.getDataToSend(componentName, stateMachineName);
	        this.webSocket.send(convertToWebsocketInputFormat("subscribe", data));
	        this.addSubscribedStateMachines(componentName, stateMachineName);
	    } 
	}


	Subscriber.prototype.getDataToSend = function (componentName, stateMachineName) {
	    var topic = this.configuration.getSubscriberTopic(componentName, stateMachineName);
	    var data = {
	        "Header": { "IncomingType": 0 },
	        "JsonMessage": JSON.stringify({ "Topic": { "Key": topic } })
	    };
	    return data;
	}


	Subscriber.prototype.unsubscribe = function (componentName, stateMachineName) {
	    if (isSubscribed(this.subscribedStateMachines, componentName, stateMachineName)) {
	        var data = this.getDataToSend(componentName, stateMachineName);
	        this.webSocket.send(convertToWebsocketInputFormat("unsubscribe", data));
	        this.removeSubscribedStateMachines(componentName, stateMachineName);
	    }
	}


	Subscriber.prototype.addSubscribedStateMachines = function (componentName, stateMachineName) {
	    if (this.subscribedStateMachines[componentName] == undefined) {
	        this.subscribedStateMachines[componentName] = [stateMachineName];
	    } else {
	        this.subscribedStateMachines[componentName].push(stateMachineName);
	    }
	}


	Subscriber.prototype.removeSubscribedStateMachines = function (componentName, stateMachineName) {
	    var index = this.subscribedStateMachines[componentName].indexOf(stateMachineName);
	    this.subscribedStateMachines[componentName].splice(index, 1);
	}


	function isSubscribed(subscribedStateMachines, componentName, stateMachineName) {
	    var isSubscribed = subscribedStateMachines[componentName] != undefined
        && subscribedStateMachines[componentName].indexOf(stateMachineName) > -1;
	    return isSubscribed;
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


    function convertToWebsocketInputFormat(susbcribeRequest, data) {
        var input = susbcribeRequest + " " + JSON.stringify(data);
        return input;
    }


    return Subscriber;
});
