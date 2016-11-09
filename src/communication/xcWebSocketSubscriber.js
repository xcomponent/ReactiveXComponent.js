define(["../javascriptHelper", "../configuration/xcWebSocketBridgeConfiguration", "rx", "pako"], function(javascriptHelper, xcWebSocketBridgeConfiguration, Rx, pako) {
    "use strict"

    var Subscriber = function(webSocket, configuration, replyPublisher, guid) {
        this.webSocket = webSocket;
        this.configuration = configuration;
        this.replyPublisher = replyPublisher;
        this.subscribedStateMachines = {};
        this.observableMsg = Rx.Observable.fromEvent(this.webSocket, 'message');
        this.guid = guid;
    }


    Subscriber.prototype.getSnapshot = function(componentName, stateMachineName, snapshotListener) {
        var codes = this.configuration.getCodes(componentName, stateMachineName);
        var replyTopic = this.guid.create();
        var thisObject = this;
        this.observableMsg
            .map(function(e) {
                try {
                    return thisObject.getJsonDataFromSnapshot(e);
                } catch (e) {
                    return null;
                }
            })
            .filter(function(data) {
                try {
                    return data.replyTopic == replyTopic;
                } catch (e) {
                    return false;
                }
            })
            .subscribe(function(data) {
                thisObject.sendUnsubscribeRequestToTopic(replyTopic, xcWebSocketBridgeConfiguration.kinds.Snapshot);
                snapshotListener(data.items);
            });
        this.sendSubscribeRequestToTopic(replyTopic, xcWebSocketBridgeConfiguration.kinds.Snapshot);
        var dataToSendSnapshot = this.getDataToSendSnapshot(componentName, stateMachineName, replyTopic);
        this.webSocket.send(convertToWebsocketInputFormat(dataToSendSnapshot.topic + " " + dataToSendSnapshot.componentCode, dataToSendSnapshot.data));
    }


    Subscriber.prototype.getDataToSendSnapshot = function(componentName, stateMachineName, replyTopic) {
        var topic = this.configuration.getSnapshotTopic(componentName);
        var codes = this.configuration.getCodes(componentName, stateMachineName);
        var jsonMessage = {
            "StateMachineCode": parseInt(codes.stateMachineCode),
            "ComponentCode": parseInt(codes.componentCode),
            "ReplyTopic": { "Case": "Some", "Fields": [replyTopic] },
            "PrivateTopic": { "Case": "Some", "Fields": [[null]] }
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


    Subscriber.prototype.getStateMachineUpdates = function(componentName, stateMachineName) {
        var filteredObservable = this.prepareStateMachineUpdates(componentName, stateMachineName);
        this.sendSubscribeRequest(componentName, stateMachineName);
        return filteredObservable;
    }


    Subscriber.prototype.prepareStateMachineUpdates = function(componentName, stateMachineName) {
        var codes = this.configuration.getCodes(componentName, stateMachineName);
        var thisObject = this;
        var filteredObservable = this.observableMsg
            .map(function(e) {
                try {
                    return thisObject.getJsonDataFromEvent(e);
                } catch (e) {
                    return null;
                }
            })
            .filter(function(jsonData) {
                try {
                    return isSameComponent(jsonData, codes) && isSameStateMachine(jsonData, codes);
                } catch (e) {
                    return false;
                }
            });
        return filteredObservable;
    }


    Subscriber.prototype.canSubscribe = function(componentName, stateMachineName) {
        return this.configuration.subscriberExist(componentName, stateMachineName);
    }


    Subscriber.prototype.subscribe = function(componentName, stateMachineName, stateMachineUpdateListener) {
        this.prepareStateMachineUpdates(componentName, stateMachineName)
            .subscribe(function(jsonData) {
                stateMachineUpdateListener(jsonData);
            });
        this.sendSubscribeRequest(componentName, stateMachineName);
    }


    Subscriber.prototype.sendSubscribeRequest = function(componentName, stateMachineName) {
        if (!isSubscribed(this.subscribedStateMachines, componentName, stateMachineName)) {
            var topic = this.configuration.getSubscriberTopic(componentName, stateMachineName);
            var kind = xcWebSocketBridgeConfiguration.kinds.Public;
            this.sendSubscribeRequestToTopic(topic, kind);
            this.addSubscribedStateMachines(componentName, stateMachineName);
        }
    }


    Subscriber.prototype.sendSubscribeRequestToTopic = function(topic, kind) {
        var data = this.getDataToSend(topic, kind);
        var command = xcWebSocketBridgeConfiguration.commands.subscribe;
        this.webSocket.send(convertToWebsocketInputFormat(command, data));
    }


    Subscriber.prototype.sendUnsubscribeRequestToTopic = function(topic, kind) {
        var data = this.getDataToSend(topic, kind);
        var command = xcWebSocketBridgeConfiguration.commands.unsubscribe;
        this.webSocket.send(convertToWebsocketInputFormat(command, data));
    }


    Subscriber.prototype.getDataToSend = function(topic, kind) {
        return {
            "Header": { "IncomingType": 0 },
            "JsonMessage": JSON.stringify({ "Topic": { "Key": topic, "kind": kind } })
        };
    }


    Subscriber.prototype.unsubscribe = function(componentName, stateMachineName) {
        if (isSubscribed(this.subscribedStateMachines, componentName, stateMachineName)) {
            var topic = this.configuration.getSubscriberTopic(componentName, stateMachineName);
            var kind = xcWebSocketBridgeConfiguration.kinds.Public;
            var data = this.getDataToSend(topic, kind);
            this.webSocket.send(convertToWebsocketInputFormat("unsubscribe", data));
            this.removeSubscribedStateMachines(componentName, stateMachineName);
        }
    }


    Subscriber.prototype.addSubscribedStateMachines = function(componentName, stateMachineName) {
        if (this.subscribedStateMachines[componentName] == undefined) {
            this.subscribedStateMachines[componentName] = [stateMachineName];
        } else {
            this.subscribedStateMachines[componentName].push(stateMachineName);
        }
    }


    Subscriber.prototype.removeSubscribedStateMachines = function(componentName, stateMachineName) {
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


    Subscriber.prototype.getJsonDataFromEvent = function(e) {
        //console.log(e.data);
        var jsonData = JSON.parse(e.data.substring(e.data.indexOf("{"), e.data.lastIndexOf("}") + 1));
        var componentCode = jsonData.Header.ComponentCode.Fields[0];
        var stateMachineCode = jsonData.Header.StateMachineCode.Fields[0];
        var stateCode = jsonData.Header.StateCode.Fields[0];
        var thisObject = this;
        var stateMachineRef = {
            "StateMachineId": jsonData.Header.StateMachineId,
            "AgentId": jsonData.Header.AgentId,
            "StateMachineCode": jsonData.Header.StateMachineCode,
            "ComponentCode": jsonData.Header.ComponentCode,
            "StateName": {
                "Case": "Some", "Fields":
                [thisObject.configuration.getStateName(componentCode, stateMachineCode, stateCode)]
            },
            "send": function(messageType, jsonMessage, visibilityPrivate) {
                thisObject.replyPublisher.sendWithStateMachineRef(this, messageType, jsonMessage, visibilityPrivate);
            }
        };
        return {
            stateMachineRef: stateMachineRef,
            jsonMessage: JSON.parse(jsonData.JsonMessage)
        };
    }


    var encodeBase64 = function(b64Data) {
        var atob = javascriptHelper.getJavascriptHelper().atob;
        var charData = atob(b64Data).split('').map(function(x) {
            return x.charCodeAt(0);
        });
        var binData = new Uint8Array(charData);
        var data = pako.inflate(binData).filter(function(x) {
            return x != 0;
        });
        var strData = String.fromCharCode.apply(null, new Uint16Array(data));
        return strData;
    }


    Subscriber.prototype.getJsonDataFromSnapshot = function(e) {
        var replyTopic = e.data.substring(0, e.data.indexOf(" "));
        var jsonData = JSON.parse(e.data.substring(e.data.indexOf("{"), e.data.lastIndexOf("}") + 1));
        var b64Data = JSON.parse(jsonData.JsonMessage).Items;
        var items = JSON.parse(encodeBase64(b64Data));
        var thisObject = this;
        for (var i = 0; i < items.length; i++) {
            (function(item) {
                item.send = function(messageType, jsonMessage, visibilityPrivate) {
                    var stateMachineRef = {
                        StateMachineCode: { "Case": "Some", "Fields": [parseInt(item.StateMachineCode)] },
                        ComponentCode: { "Case": "Some", "Fields": [parseInt(item.ComponentCode)] },
                        AgentId: { "Case": "Some", "Fields": [parseInt(item.AgentId)] },
                        StateMachineId: { "Case": "Some", "Fields": [parseInt(item.StateMachineId)] }
                    };
                    thisObject.replyPublisher.sendWithStateMachineRef(stateMachineRef, messageType, jsonMessage, visibilityPrivate);
                };
            })(items[i]);
            items[i].StateName = thisObject.configuration.getStateName(items[i].ComponentCode, items[i].StateMachineCode, items[i].StateCode);
        }
        return {
            items: items,
            replyTopic: replyTopic
        };
    }


    function convertToWebsocketInputFormat(request, data) {
        var input = request + " " + JSON.stringify(data);
        return input;
    }


    return Subscriber;
});
