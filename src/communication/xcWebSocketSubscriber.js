define(["rx", "pako"], function (Rx, pako) {
	"use strict"

	var Subscriber = function (webSocket, configuration, replyPublisher) {
		this.webSocket = webSocket;
		this.configuration = configuration;
		this.replyPublisher = replyPublisher;
		this.subscribedStateMachines = {};
		this.observableMsg = Rx.Observable.fromEvent(this.webSocket, 'message');
		this.observableSnaphots = Rx.Observable.fromEvent(this.webSocket, 'message');
	}



	Subscriber.prototype.getSnapshot = function (componentName, stateMachineName, snapshotListener) {
		this.observableSnaphots
			.map(function (e) {
				return getJsonArrayFromSnapshot(e);
			}).subscribe(function (jsonArray) {
				snapshotListener(jsonArray);
			});
		var dataToSendSnapshot = this.getDataToSendSnapshot(componentName, stateMachineName);
		this.webSocket.send(dataToSendSnapshot.topic + " " + dataToSendSnapshot.componentCode + " " + JSON.stringify(dataToSendSnapshot.data));
	}


	/**
	 * var m = 'snapshot.1_0.HelloWorldMicroservice.HelloWorld -69981087 {"Header":{"IncomingType":0},
	 * "JsonMessage":"{\\"StateMachineCode\\":-343862282,
	 * \\"ComponentCode\\":-69981087,
	 * \\"ReplyTopic\\":{\\"Case\\":\\"Some\\",\\"Fields\\":[\\"c3069fb6-d0e0-450b-bd17\\"]},
	 * \\"PrivateTopic\\":{\\"Case\\":\\"Some\\",\\"Fields\\":[[\\"45d50151-2206-401e-9dc3\\"]]}}"}'
	 * 
	 */
	Subscriber.prototype.getDataToSendSnapshot = function (componentName, stateMachineName) {
		var topic = this.configuration.getSnapshotTopic(componentName);
		var codes = this.configuration.getCodes(componentName, stateMachineName);
		var jsonMessage = {
			"StateMachineCode": parseInt(codes.stateMachineCode),
			"ComponentCode": parseInt(codes.componentCode),
			"ReplyTopic": { "Case": "Some", "Fields": ["c3069fb6-d0e0-450b-bd17"] },
			"PrivateTopic": { "Case": "Some", "Fields": [["45d50151-2206-401e-9dc3"]] }
		};
		var dataToSendSnapshot = {
			topic: topic,
			componentCode: codes.componentCode,
			data: {
				"Header": { "IncomingType": 0 },
				"JsonMessage": JSON.stringify(jsonMessage)
			}
		};
		return dataToSendSnapshot;
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


	var getJsonArrayFromSnapshot = function (e) {
		var jsonData = JSON.parse(e.data.substring(e.data.indexOf("{"), e.data.lastIndexOf("}") + 1));
		//TODO nodejs atob
		var b64Data = JSON.parse(jsonData.JsonMessage).Items;
		console.log(b64Data);
		var strData = window.atob(b64Data);
		var charData = strData.split('').map(function (x) { return x.charCodeAt(0); });
		var binData = new Uint8Array(charData);
		var data = pako.inflate(binData);
		var strData = String.fromCharCode.apply(null, new Uint16Array(data));
		//console.log(strData);
		return strData;
		//return JSON.parse(strData);
	}


    function convertToWebsocketInputFormat(susbcribeRequest, data) {
        var input = susbcribeRequest + " " + JSON.stringify(data);
        return input;
    }


    return Subscriber;
});
