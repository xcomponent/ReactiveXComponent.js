import {javascriptHelper} from "javascriptHelper";
import xcWebSocketBridgeConfiguration from "configuration/xcWebSocketBridgeConfiguration";
let Rx = require("rx");
import pako = require("pako");

import Configuration from "configuration/xcConfiguration";
import Publisher from "communication/xcWebSocketPublisher";
import Guid from "guid";

class Subscriber {

    private webSocket : WebSocket;
    private configuration : Configuration;
    private guid : Guid;
    private subscribedStateMachines : {[componentName : string] : Array<String>};
    private observableMsg : any;
    private observableSubscribers : Array<any>;

    public privateTopics : Array<String>;
    public replyPublisher : Publisher;

    constructor(webSocket : WebSocket, configuration : Configuration, replyPublisher : Publisher, guid : Guid, privateTopics : Array<String>) {
        this.webSocket = webSocket;
        this.configuration = configuration;
        this.replyPublisher = replyPublisher;
        this.subscribedStateMachines = {};
        this.observableMsg = Rx
            .Observable
            .fromEvent(this.webSocket, "message");
        this.observableSubscribers = [];
        this.guid = guid;
        this.privateTopics = privateTopics;
    }

    getXcApiList(getXcApiListListener : (apis : Array<Object>) => void) {
        let thisSubscriber = this;
        this
            .observableMsg
            .map(function (e) {
                return thisSubscriber.getJsonDataFromGetXcApiListRequest(e);
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
        this
            .webSocket
            .send(this.convertToWebsocketInputFormat(command, data));
    };

    getXcApi(xcApiFileName : string, getXcApiListener : (xcApi : string) => void) {
        let thisSubscriber = this;
        this
            .observableMsg
            .map(function (e) {
                try {
                    return thisSubscriber.getJsonDataFromXcApiRequest(e);
                } catch (e) {
                    return null;
                }
            })
            .filter(function (xcApi) {
                return xcApi != null;
            })
            .subscribe(function (xcApi) {
                console.log(xcApiFileName + " received successfully");
                getXcApiListener(xcApi);
            });
        let command = xcWebSocketBridgeConfiguration.commands.getXcApi;
        let data = {
            Name: xcApiFileName
        };
        this
            .webSocket
            .send(this.convertToWebsocketInputFormat(command, data));
    };

    getSnapshot(componentName : string, stateMachineName : string, snapshotListener : (items : Array<Object>) => void) {
        let codes = this
            .configuration
            .getCodes(componentName, stateMachineName);
        let replyTopic = this
            .guid
            .create();
        let thisSubscriber = this;
        this
            .observableMsg
            .map(function (e) {
                try {
                    return thisSubscriber.getJsonDataFromSnapshot(e);
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
                thisSubscriber.sendUnsubscribeRequestToTopic(replyTopic, xcWebSocketBridgeConfiguration.kinds.Snapshot);
                snapshotListener(data.items);
            });
        this.sendSubscribeRequestToTopic(replyTopic, xcWebSocketBridgeConfiguration.kinds.Snapshot);
        let dataToSendSnapshot = this.getDataToSendSnapshot(componentName, stateMachineName, replyTopic);
        this
            .webSocket
            .send(this.convertToWebsocketInputFormat(dataToSendSnapshot.topic + " " + dataToSendSnapshot.componentCode, dataToSendSnapshot.data));
    };

    getDataToSendSnapshot(componentName : string, stateMachineName : string, replyTopic : string) {
        let topic = this
            .configuration
            .getSnapshotTopic(componentName);
        let codes = this
            .configuration
            .getCodes(componentName, stateMachineName);
        let thisSubscriber = this;
        let jsonMessage = {
            "StateMachineCode": parseInt(codes.stateMachineCode),
            "ComponentCode": parseInt(codes.componentCode),
            "ReplyTopic": {
                "Case": "Some",
                "Fields": [replyTopic]
            },
            "PrivateTopic": {
                "Case": "Some",
                "Fields": [thisSubscriber.privateTopics]
            }
        };
        let dataToSendSnapshot = {
            topic: topic,
            componentCode: codes.componentCode,
            data: {
                "Header": {
                    "IncomingType": 0
                },
                "JsonMessage": JSON.stringify(jsonMessage)
            }
        };
        return dataToSendSnapshot;
    };

    getStateMachineUpdates(componentName : string, stateMachineName : string) {
        let filteredObservable = this.prepareStateMachineUpdates(componentName, stateMachineName);
        this.sendSubscribeRequest(componentName, stateMachineName);
        return filteredObservable;
    };

    prepareStateMachineUpdates(componentName : string, stateMachineName : string) {
        let codes = this
            .configuration
            .getCodes(componentName, stateMachineName);
        let thisSubscriber = this;
        let filteredObservable = this
            .observableMsg
            .map(function (e) {
                try {
                    return thisSubscriber.getJsonDataFromEvent(e);
                } catch (e) {
                    return null;
                }
            })
            .filter(function (jsonData) {
                try {
                    return thisSubscriber.isSameComponent(jsonData, codes) && thisSubscriber.isSameStateMachine(jsonData, codes);
                } catch (e) {
                    return false;
                }
            });
        return filteredObservable;
    };

    canSubscribe(componentName : string, stateMachineName : string) {
        return this
            .configuration
            .subscriberExist(componentName, stateMachineName);
    };

    subscribe(componentName : string, stateMachineName : string, stateMachineUpdateListener : (data : any) => void) {
        let observableSubscriber = this
            .prepareStateMachineUpdates(componentName, stateMachineName)
            .subscribe(function (jsonData) {
                stateMachineUpdateListener(jsonData);
            });
        this
            .observableSubscribers
            .push(observableSubscriber);
        this.sendSubscribeRequest(componentName, stateMachineName);
    };

    sendSubscribeRequest(componentName : string, stateMachineName : string) {
        if (!this.isSubscribed(this.subscribedStateMachines, componentName, stateMachineName)) {
            let topic = this
                .configuration
                .getSubscriberTopic(componentName, stateMachineName);
            let kind = xcWebSocketBridgeConfiguration.kinds.Public;
            this.sendSubscribeRequestToTopic(topic, kind);
            this.addSubscribedStateMachines(componentName, stateMachineName);
        }
    };

    sendSubscribeRequestToTopic(topic : string, kind : number) {
        let data = this.getDataToSend(topic, kind);
        let command = xcWebSocketBridgeConfiguration.commands.subscribe;
        this
            .webSocket
            .send(this.convertToWebsocketInputFormat(command, data));
    };

    sendUnsubscribeRequestToTopic(topic : string, kind : number) {
        let data = this.getDataToSend(topic, kind);
        let command = xcWebSocketBridgeConfiguration.commands.unsubscribe;
        this
            .webSocket
            .send(this.convertToWebsocketInputFormat(command, data));
    };

    getDataToSend(topic : string, kind : number) {
        return {
            "Header": {
                "IncomingType": 0
            },
            "JsonMessage": JSON.stringify({
                "Topic": {
                    "Key": topic,
                    "kind": kind
                }
            })
        };
    };

    unsubscribe(componentName : string, stateMachineName : string) {
        if (this.isSubscribed(this.subscribedStateMachines, componentName, stateMachineName)) {
            let topic = this
                .configuration
                .getSubscriberTopic(componentName, stateMachineName);
            let kind = xcWebSocketBridgeConfiguration.kinds.Public;
            let data = this.getDataToSend(topic, kind);
            let command = xcWebSocketBridgeConfiguration.commands.unsubscribe;
            this
                .webSocket
                .send(this.convertToWebsocketInputFormat(command, data));
            this.removeSubscribedStateMachines(componentName, stateMachineName);
        }
    };

    dispose() {
        for (let i = 0; i < this.observableSubscribers.length; i++) {
            this
                .observableSubscribers[i]
                .dispose();
        }
        this.observableSubscribers = [];
    };

    addSubscribedStateMachines(componentName : string, stateMachineName : string) {
        if (this.subscribedStateMachines[componentName] === undefined) {
            this.subscribedStateMachines[componentName] = [stateMachineName];
        } else {
            this
                .subscribedStateMachines[componentName]
                .push(stateMachineName);
        }
    };

    removeSubscribedStateMachines(componentName : string, stateMachineName : string) {
        let index = this
            .subscribedStateMachines[componentName]
            .indexOf(stateMachineName);
        this
            .subscribedStateMachines[componentName]
            .splice(index, 1);
    };

    private isSubscribed(subscribedStateMachines : any, componentName : any, stateMachineName : string) {
        let isSubscribed = subscribedStateMachines[componentName] !== undefined && subscribedStateMachines[componentName].indexOf(stateMachineName) > -1;
        return isSubscribed;
    }

    private isSameComponent(jsonData : any, codes : any) {
        let sameComponent = jsonData.stateMachineRef.ComponentCode === parseInt(codes.componentCode);
        return sameComponent;
    }

    private isSameStateMachine(jsonData : any, codes : any) {
        let sameStateMachine = jsonData.stateMachineRef.StateMachineCode === parseInt(codes.stateMachineCode);
        return sameStateMachine;
    }

    getJsonDataFromEvent(e : any) {
        let jsonData = this.getJsonData(e.data);
        let componentCode = jsonData.Header.ComponentCode.Fields[0];
        let stateMachineCode = jsonData.Header.StateMachineCode.Fields[0];
        let stateCode = jsonData.Header.StateCode.Fields[0];
        let thisSubscriber = this;
        let stateMachineRef = {
            "StateMachineId": jsonData.Header.StateMachineId.Fields[0],
            "AgentId": jsonData.Header.AgentId.Fields[0],
            "StateMachineCode": jsonData.Header.StateMachineCode.Fields[0],
            "ComponentCode": jsonData.Header.ComponentCode.Fields[0],
            "StateName": thisSubscriber
                .configuration
                .getStateName(componentCode, stateMachineCode, stateCode),
            "send": function (messageType, jsonMessage, visibilityPrivate) {
                thisSubscriber
                    .replyPublisher
                    .sendWithStateMachineRef(this, messageType, jsonMessage, visibilityPrivate, undefined);
            }
        };
        return {
            stateMachineRef: stateMachineRef,
            jsonMessage: JSON.parse(jsonData.JsonMessage)
        };
    };

    private encodeBase64(b64Data : string) {
        let atob = javascriptHelper().atob;
        let charData = atob(b64Data)
            .split("")
            .map(function (x) {
                return x.charCodeAt(0);
            });
        let binData = new Uint8Array(charData);
        let data = pako
            .inflate(binData)
            .filter(function (x) {
                return x !== 0;
            });
        let finalData = new Uint16Array(data);
        let strData = "";
        for (let i = 0; i < finalData.length; i++) {
            strData += String.fromCharCode(finalData[i]);
        }
        return strData;
    };

    getJsonDataFromSnapshot(e : any) {
        let replyTopic = this.getCommand(e.data);
        let jsonData = this.getJsonData(e.data);
        let b64Data = JSON
            .parse(jsonData.JsonMessage)
            .Items;
        let items;
        try {
            items = JSON.parse(this.encodeBase64(b64Data));
        } catch (e) {
            items = b64Data;
        }
        let snapshotItems = [];
        let thisSubscriber = this;
        for (let i = 0; i < items.length; i++) {
            let stateMachineRef = {
                "StateMachineId": parseInt(items[i].StateMachineId),
                "AgentId": parseInt(items[i].AgentId),
                "StateMachineCode": parseInt(items[i].StateMachineCode),
                "ComponentCode": parseInt(items[i].ComponentCode),
                "StateName": thisSubscriber
                    .configuration
                    .getStateName(items[i].ComponentCode, items[i].StateMachineCode, items[i].StateCode),
                "send": function (messageType, jsonMessage, visibilityPrivate) {
                    thisSubscriber
                        .replyPublisher
                        .sendWithStateMachineRef(this, messageType, jsonMessage, visibilityPrivate, undefined);
                }
            };
            snapshotItems.push({stateMachineRef: stateMachineRef, jsonMessage: items[i].PublicMember});
        }

        return {items: snapshotItems, replyTopic: replyTopic};
    };

    getJsonDataFromXcApiRequest(e : any) {
        let jsonData = this.getJsonData(e.data);
        if (xcWebSocketBridgeConfiguration.commands.getXcApi !== this.getCommand(e.data)) {
            return null;
        } else {
            return this.encodeBase64(jsonData.Content);
        }
    };

    getJsonDataFromGetXcApiListRequest(e : any) {
        let jsonData = this.getJsonData(e.data);
        if (xcWebSocketBridgeConfiguration.commands.getXcApiList !== this.getCommand(e.data)) {
            return null;
        } else {
            return jsonData.Apis;
        }
    };

    private getJsonData(data : any) {
        return JSON.parse(data.substring(data.indexOf("{"), data.lastIndexOf("}") + 1));
    }

    private getCommand(data : any) {
        return data.substring(0, data.indexOf(" "));
    }

    private convertToWebsocketInputFormat(request : string, data : any) {
        let input = request + " " + JSON.stringify(data);
        return input;
    }
}

export default Subscriber;