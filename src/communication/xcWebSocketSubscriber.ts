import { javascriptHelper } from "javascriptHelper";
import xcWebSocketBridgeConfiguration from "configuration/xcWebSocketBridgeConfiguration";
import { ApiConfiguration, SubscriberEventType } from "configuration/apiConfiguration";
let Rx = require("rx");
import pako = require("pako");

let Subscriber = function (webSocket, configuration: ApiConfiguration, replyPublisher, guid, privateTopics) {
    this.webSocket = webSocket;
    this.configuration = configuration;
    this.replyPublisher = replyPublisher;
    this.subscribedStateMachines = {};
    this.observableMsg = Rx.Observable.fromEvent(this.webSocket, "message");
    this.observableSubscribers = [];
    this.guid = guid;
    this.privateTopics = privateTopics;
};


Subscriber.prototype.getXcApiList = function (getXcApiListListener) {
    let thisObject = this;
    this.observableMsg
        .map(function (e) {
            return thisObject.getJsonDataFromGetXcApiListRequest(e);
        })
        .filter(function (apis) {
            return apis != null;
        })
        .subscribe(function (apis) {
            console.log("ApiList received successfully");
            getXcApiListListener(apis);
        });
    let command = xcWebSocketBridgeConfiguration.commands.getXcApiList;
    let data = {};
    this.webSocket.send(convertToWebsocketInputFormat(command, data));
};


Subscriber.prototype.getXcApi = function (xcApiFileName, getXcApiListener) {
    let thisObject = this;
    this.observableMsg
        .map(function (e) {
            try {
                return thisObject.getJsonDataFromXcApiRequest(e, xcApiFileName);
            } catch (e) {
                console.error(e);
                return null;
            }
        })
        .filter(function (xcApi) {
            return xcApi != null;
        })
        .subscribe(function (xcApi) {
            console.log(xcApiFileName + " " + "received successfully");
            getXcApiListener(xcApi);
        });
    let command = xcWebSocketBridgeConfiguration.commands.getXcApi;
    let data = { Name: xcApiFileName };
    this.webSocket.send(convertToWebsocketInputFormat(command, data));
};

Subscriber.prototype.getSnapshot = function (componentName, stateMachineName, snapshotListener) {
    let codes = this.configuration.getCodes(componentName, stateMachineName);
    let replyTopic = this.guid.create();
    let thisObject = this;
    this.observableMsg
        .map(function (e) {
            try {
                return thisObject.getJsonDataFromSnapshot(e);
            } catch (e) {
                return null;
            }
        })
        .filter(function (data) {
            try {
                return data.replyTopic === replyTopic;
            } catch (e) {
                return false;
            }
        })
        .subscribe(function (data) {
            thisObject.sendUnsubscribeRequestToTopic(replyTopic, xcWebSocketBridgeConfiguration.kinds.Snapshot);
            snapshotListener(data.items);
        });
    this.sendSubscribeRequestToTopic(replyTopic, xcWebSocketBridgeConfiguration.kinds.Snapshot);
    let dataToSendSnapshot = this.getDataToSendSnapshot(componentName, stateMachineName, replyTopic);
    this.webSocket.send(convertToWebsocketInputFormat(dataToSendSnapshot.topic + " " + dataToSendSnapshot.componentCode, dataToSendSnapshot.data));
};


Subscriber.prototype.getDataToSendSnapshot = function (componentName, stateMachineName, replyTopic) {
    let codes = this.configuration.getCodes(componentName, stateMachineName);
    let topic = this.configuration.getSnapshotTopic(codes.componentCode);
    let thisObject = this;
    let jsonMessage = {
        "StateMachineCode": parseInt(codes.stateMachineCode),
        "ComponentCode": parseInt(codes.componentCode),
        "ReplyTopic": { "Case": "Some", "Fields": [replyTopic] },
        "PrivateTopic": {
            "Case": "Some",
            "Fields": [
                thisObject.privateTopics
            ]
        }
    };
    let dataToSendSnapshot = {
        topic: topic,
        componentCode: codes.componentCode,
        data: {
            "Header": { "IncomingType": 0 },
            "JsonMessage": JSON.stringify(jsonMessage)
        }
    };
    return dataToSendSnapshot;
};


Subscriber.prototype.getStateMachineUpdates = function (componentName, stateMachineName) {
    let filteredObservable = this.prepareStateMachineUpdates(componentName, stateMachineName);
    this.sendSubscribeRequest(componentName, stateMachineName);
    return filteredObservable;
};


Subscriber.prototype.prepareStateMachineUpdates = function (componentName, stateMachineName) {
    let codes = this.configuration.getCodes(componentName, stateMachineName);
    let thisObject = this;
    let filteredObservable = this.observableMsg
        .map(function (e) {
            try {
                return thisObject.getJsonDataFromEvent(e);
            } catch (e) {
                console.error(e);
                return null;
            }
        })
        .filter(function (jsonData) {
            try {
                return isSameComponent(jsonData, codes) && isSameStateMachine(jsonData, codes);
            } catch (e) {
                return false;
            }
        });
    return filteredObservable;
};


Subscriber.prototype.canSubscribe = function (componentName, stateMachineName) {
    let codes = this.configuration.getCodes(componentName, stateMachineName);
    return this.configuration.containsSubscriber(codes.componentCode, codes.stateMachineCode);
};


Subscriber.prototype.subscribe = function (componentName, stateMachineName, stateMachineUpdateListener) {
    let observableSubscriber = this.prepareStateMachineUpdates(componentName, stateMachineName)
        .subscribe(function (jsonData) {
            stateMachineUpdateListener(jsonData);
        });
    this.observableSubscribers.push(observableSubscriber);
    this.sendSubscribeRequest(componentName, stateMachineName);
};


Subscriber.prototype.sendSubscribeRequest = function (componentName, stateMachineName) {
    if (!isSubscribed(this.subscribedStateMachines, componentName, stateMachineName)) {
        let codes = this.configuration.getCodes(componentName, stateMachineName);
        let topic = this.configuration.getSubscriberTopic(codes.componentCode, codes.stateMachineCode, SubscriberEventType.Update);
        let kind = xcWebSocketBridgeConfiguration.kinds.Public;
        this.sendSubscribeRequestToTopic(topic, kind);
        this.addSubscribedStateMachines(componentName, stateMachineName);
    }
};


Subscriber.prototype.sendSubscribeRequestToTopic = function (topic, kind) {
    let data = this.getDataToSend(topic, kind);
    let command = xcWebSocketBridgeConfiguration.commands.subscribe;
    this.webSocket.send(convertToWebsocketInputFormat(command, data));
};


Subscriber.prototype.sendUnsubscribeRequestToTopic = function (topic, kind) {
    let data = this.getDataToSend(topic, kind);
    let command = xcWebSocketBridgeConfiguration.commands.unsubscribe;
    this.webSocket.send(convertToWebsocketInputFormat(command, data));
};


Subscriber.prototype.getDataToSend = function (topic, kind) {
    return {
        "Header": { "IncomingType": 0 },
        "JsonMessage": JSON.stringify({ "Topic": { "Key": topic, "kind": kind } })
    };
};


Subscriber.prototype.unsubscribe = function (componentName, stateMachineName) {
    if (isSubscribed(this.subscribedStateMachines, componentName, stateMachineName)) {
        let codes = this.configuration.getCodes(componentName, stateMachineName);
        let topic = this.configuration.getSubscriberTopic(codes.componentCode, codes.stateMachineCode, SubscriberEventType.Update);
        let kind = xcWebSocketBridgeConfiguration.kinds.Public;
        let data = this.getDataToSend(topic, kind);
        let command = xcWebSocketBridgeConfiguration.commands.unsubscribe;
        this.webSocket.send(convertToWebsocketInputFormat(command, data));
        this.removeSubscribedStateMachines(componentName, stateMachineName);
    }
};


Subscriber.prototype.dispose = function () {
    for (let i = 0; i < this.observableSubscribers.length; i++) {
        this.observableSubscribers[i].dispose();
    }
    this.observableSubscribers = [];
};


Subscriber.prototype.addSubscribedStateMachines = function (componentName, stateMachineName) {
    if (this.subscribedStateMachines[componentName] === undefined) {
        this.subscribedStateMachines[componentName] = [stateMachineName];
    } else {
        this.subscribedStateMachines[componentName].push(stateMachineName);
    }
};


Subscriber.prototype.removeSubscribedStateMachines = function (componentName, stateMachineName) {
    let index = this.subscribedStateMachines[componentName].indexOf(stateMachineName);
    this.subscribedStateMachines[componentName].splice(index, 1);
};


function isSubscribed(subscribedStateMachines, componentName, stateMachineName) {
    let isSubscribed = subscribedStateMachines[componentName] !== undefined &&
        subscribedStateMachines[componentName].indexOf(stateMachineName) > -1;
    return isSubscribed;
}


function isSameComponent(jsonData, codes) {
    let sameComponent = jsonData.stateMachineRef.ComponentCode === parseInt(codes.componentCode);
    return sameComponent;
}


function isSameStateMachine(jsonData, codes) {
    let sameStateMachine = jsonData.stateMachineRef.StateMachineCode === parseInt(codes.stateMachineCode);
    return sameStateMachine;
}


Subscriber.prototype.getJsonDataFromEvent = function (e) {
    let jsonData = getJsonData(e.data);
    let componentCode = jsonData.Header.ComponentCode.Fields[0];
    let stateMachineCode = jsonData.Header.StateMachineCode.Fields[0];
    let stateCode = jsonData.Header.StateCode.Fields[0];
    let thisObject = this;
    let stateMachineRef = {
        "StateMachineId": jsonData.Header.StateMachineId.Fields[0],
        "AgentId": jsonData.Header.AgentId.Fields[0],
        "StateMachineCode": jsonData.Header.StateMachineCode.Fields[0],
        "ComponentCode": jsonData.Header.ComponentCode.Fields[0],
        "StateName": thisObject.configuration.getStateName(componentCode, stateMachineCode, stateCode),
        "send": function (messageType, jsonMessage, visibilityPrivate) {
            thisObject.replyPublisher.sendWithStateMachineRef(this, messageType, jsonMessage, visibilityPrivate);
        }
    };
    return {
        stateMachineRef: stateMachineRef,
        jsonMessage: JSON.parse(jsonData.JsonMessage)
    };
};


let decodeServerMessage = function (b64Data) {
    let atob = javascriptHelper().atob;
    let charData = atob(b64Data).split("").map(function (x) {
        return x.charCodeAt(0);
    });

    let binData = new Uint8Array(charData);
    let data = pako.inflate(binData).filter(function (x) {
        return x !== 0;
    });
    let finalData = new Uint16Array(data);
    let strData = "";
    for (let i = 0; i < finalData.length; i++) {
        strData += String.fromCharCode(finalData[i]);
    }
    return strData;
};


Subscriber.prototype.getJsonDataFromSnapshot = function (e) {
    let replyTopic = getCommand(e.data);
    let jsonData = getJsonData(e.data);
    let b64Data = JSON.parse(jsonData.JsonMessage).Items;
    let items;
    try {
        items = JSON.parse(decodeServerMessage(b64Data));
    } catch (e) {
        items = b64Data;
    }
    let snapshotItems = [];
    let thisObject = this;
    for (let i = 0; i < items.length; i++) {
        let stateMachineRef = {
            "StateMachineId": parseInt(items[i].StateMachineId),
            "AgentId": parseInt(items[i].AgentId),
            "StateMachineCode": parseInt(items[i].StateMachineCode),
            "ComponentCode": parseInt(items[i].ComponentCode),
            "StateName": thisObject.configuration.getStateName(items[i].ComponentCode, items[i].StateMachineCode, items[i].StateCode),
            "send": function (messageType, jsonMessage, visibilityPrivate) {
                thisObject.replyPublisher.sendWithStateMachineRef(this, messageType, jsonMessage, visibilityPrivate);
            }
        };
        snapshotItems.push({
            stateMachineRef: stateMachineRef,
            jsonMessage: items[i].PublicMember
        });
    }

    return {
        items: snapshotItems,
        replyTopic: replyTopic
    };
};


Subscriber.prototype.getJsonDataFromXcApiRequest = function (e, xcApiFileName) {
    let jsonData = getJsonData(e.data);
    if (xcWebSocketBridgeConfiguration.commands.getXcApi !== getCommand(e.data)) {
        return null;
    } else {
        return decodeServerMessage(jsonData.Content);
    }
};


Subscriber.prototype.getJsonDataFromGetXcApiListRequest = function (e) {
    let jsonData = getJsonData(e.data);
    if (xcWebSocketBridgeConfiguration.commands.getXcApiList !== getCommand(e.data)) {
        return null;
    } else {
        return jsonData.Apis;
    }
};


function getJsonData(data) {
    return JSON.parse(data.substring(data.indexOf("{"), data.lastIndexOf("}") + 1));
}


function getCommand(data) {
    return data.substring(0, data.indexOf(" "));
}


function convertToWebsocketInputFormat(request, data) {
    let input = request + " " + JSON.stringify(data);
    return input;
}

export default Subscriber;