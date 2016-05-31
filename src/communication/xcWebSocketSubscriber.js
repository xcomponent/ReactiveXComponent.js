define(["rx"], function (Rx) {
	"use strict"

	var Subscriber = function (webSocket, configuration) {
	    this.webSocket = webSocket;
	    this.configuration = configuration;
	    this.observableMsg = Rx.Observable.fromEvent(webSocket, 'message');
	}

    //	    this.subscribedTopic = []; TODOooooooooooooo
	Subscriber.prototype.getEventToSend = function (componentName, stateMachineName) {
	    var topic = this.configuration.getSubscriberTopic(componentName, stateMachineName)
        var data = {
            "Header": { "IncomingType": 0 },
            "JsonMessage": JSON.stringify({ "Topic": { "Key": topic }})
        };
        return data;
    }


	Subscriber.prototype.subscribe = function (componentName, stateMachineName, subscriberListener) {
	    var codes = this.configuration.getCodes(componentName, stateMachineName);
	    var data = this.getEventToSend(componentName, stateMachineName);
	    this.webSocket.send(convertToWebsocketInputFormat(data));
	    this.observableMsg
        .filter(function (e) {
            var jsonData = getJsonDataFromEvent(e);
            return isSameComponent(jsonData, codes) && isSameStateMachine(jsonData, codes);
        })
	    .subscribe(function (e) {
	        var jsonData = getJsonDataFromEvent(e);
	        subscriberListener(jsonData);
	    });
    }


	function isSameComponent(jsonData, codes) {
	    var sameComponent = jsonData.Header.ComponentCode.Fields[0] == parseInt(codes.componentCode);
	    return sameComponent;
	}


	function isSameStateMachine(jsonData, codes) {
	    var sameStateMachine = jsonData.Header.StateMachineCode.Fields[0] == parseInt(codes.stateMachineCode);
	    return sameStateMachine;
	}


	function getJsonDataFromEvent(e) {
	    var jsonData = JSON.parse(e.data.substring(e.data.indexOf("{"), e.data.lastIndexOf("}") + 1));
	    return jsonData;
	}


    function convertToWebsocketInputFormat(data) {
        var input = "subscribe " + JSON.stringify(data);
        return input;
    }


    return Subscriber;
});
