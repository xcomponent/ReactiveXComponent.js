import { javascriptHelper } from "javascriptHelper";
import { Commands, Kinds } from "configuration/xcWebSocketBridgeConfiguration";
import { ApiConfiguration, SubscriberEventType } from "configuration/apiConfiguration";
let Rx = require("rx");
import pako = require("pako");

import { Publisher } from "communication/xcWebSocketPublisher";
import Guid from "guid";

class Subscriber {

    private webSocket: WebSocket;
    private configuration: ApiConfiguration;
    private guid: Guid;
    private subscribedStateMachines: { [componentName: string]: Array<String> };
    private observableMsg: any;
    private observableSubscribers: Array<any>;

    public privateTopics: Array<String>;
    public replyPublisher: Publisher;

    constructor(webSocket: WebSocket, configuration: ApiConfiguration, replyPublisher: Publisher, guid: Guid, privateTopics: Array<String>) {
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

    getModel(xcApiName: string, getModelListener: (model: any) => void) {
        let thisSubscriber = this;
        let command = Commands[Commands.getModel];
        this.observableMsg
            .map(function (e) {
                return thisSubscriber.deserializeWithoutTopic(e.data);
            })
            .filter(function (data) {
                return data.command === command;
            })
            .subscribe(function (data) {
                console.log("Model " + xcApiName + " received successfully");
                let model = thisSubscriber.getJsonDataFromGetModelRequest(data.stringData);
                getModelListener(model);
            });
        let data = {
            "Name": xcApiName
        };
        let input = this.convertToWebsocketInputFormat(command, data);
        this.webSocket.send(input);
    }


    getXcApiList(getXcApiListListener: (apis: Array<String>) => void) {
        let thisSubscriber = this;
        let command = Commands[Commands.getXcApiList];
        this.observableMsg
            .map(function (e) {
                return thisSubscriber.deserializeWithoutTopic(e.data);
            })
            .filter(function (data) {
                return data.command === command;
            })
            .subscribe(function (data) {
                console.log("ApiList received successfully");
                getXcApiListListener(thisSubscriber.getJsonDataFromGetXcApiListRequest(data.stringData));
            });
        let data = {};
        this.webSocket.send(thisSubscriber.convertToWebsocketInputFormat(command, data));
    };


    getXcApi(xcApiFileName: string, getXcApiListener: (xcApi: string) => void) {
        let thisSubscriber = this;
        let command = Commands[Commands.getXcApi];
        this.observableMsg
            .map(function (e) {
                return thisSubscriber.deserializeWithoutTopic(e.data);
            })
            .filter(function (data) {
                return data.command === command;
            })
            .subscribe(function (data) {
                console.log(xcApiFileName + " " + "received successfully");
                getXcApiListener(thisSubscriber.getJsonDataFromXcApiRequest(data.stringData));
            });
        let data = { Name: xcApiFileName };
        this.webSocket.send(thisSubscriber.convertToWebsocketInputFormat(command, data));
    };


    getSnapshot(componentName: string, stateMachineName: string, snapshotListener: (items: Array<Object>) => void) {
        let replyTopic = this.guid.create();
        let thisSubscriber = this;
        this.observableMsg
            .map(function (e) {
                return thisSubscriber.deserialize(e.data);
            })
            .filter(function (data) {
                return data.command === Commands[Commands.snapshot] && data.topic === replyTopic;
            })
            .subscribe(function (data) {
                thisSubscriber.sendUnsubscribeRequestToTopic(replyTopic, Kinds.Snapshot);
                snapshotListener(thisSubscriber.getJsonDataFromSnapshot(data.stringData));
            });
        this.sendSubscribeRequestToTopic(replyTopic, Kinds.Snapshot);
        let dataToSendSnapshot = this.getDataToSendSnapshot(componentName, stateMachineName, replyTopic);
        this.webSocket.send(this.convertToWebsocketInputFormat(dataToSendSnapshot.topic + " " + dataToSendSnapshot.componentCode, dataToSendSnapshot.data));
    };

    getDataToSendSnapshot(componentName: string, stateMachineName: string, replyTopic: string) {
        const componentCode = this.configuration.getComponentCode(componentName);
        const stateMachineCode = this.configuration.getStateMachineCode(componentName, stateMachineName);
        let topic = this.configuration.getSnapshotTopic(componentCode);
        let thisObject = this;
        let jsonMessage = {
            "StateMachineCode": stateMachineCode,
            "ComponentCode": componentCode,
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
            componentCode: componentCode,
            data: {
                "Header": { "IncomingType": 0 },
                "JsonMessage": JSON.stringify(jsonMessage)
            }
        };
        return dataToSendSnapshot;
    }


    prepareStateMachineUpdates(componentName: string, stateMachineName: string) {
        const componentCode = this.configuration.getComponentCode(componentName);
        const stateMachineCode = this.configuration.getStateMachineCode(componentName, stateMachineName);
        let thisSubscriber = this;
        let filteredObservable = this.observableMsg
            .map(rawMessage => thisSubscriber.deserialize(rawMessage.data))
            .filter(data => data.command === Commands[Commands.update])
            .map(data => thisSubscriber.getJsonDataFromEvent(data.stringData))
            .filter(jsonData => thisSubscriber.isSameComponent(jsonData, componentCode) && thisSubscriber.isSameStateMachine(jsonData, stateMachineCode));
        return filteredObservable;
    };



    private isSameComponent(jsonData: any, componentCode: number) {
        let sameComponent = jsonData.stateMachineRef.ComponentCode === componentCode;
        return sameComponent;
    }

    private isSameStateMachine(jsonData: any, stateMachineCode: number) {
        let sameStateMachine = jsonData.stateMachineRef.StateMachineCode === stateMachineCode;
        return sameStateMachine;
    }

    getStateMachineUpdates(componentName: string, stateMachineName: string) {
        let filteredObservable = this.prepareStateMachineUpdates(componentName, stateMachineName);
        this.sendSubscribeRequest(componentName, stateMachineName);
        return filteredObservable;
    };


    canSubscribe(componentName: string, stateMachineName: string) {
        const componentCode = this.configuration.getComponentCode(componentName);
        const stateMachineCode = this.configuration.getStateMachineCode(componentName, stateMachineName);
        return this.configuration.containsSubscriber(componentCode, stateMachineCode, SubscriberEventType.Update);
    };


    subscribe(componentName: string, stateMachineName: string, stateMachineUpdateListener: (data: any) => void) {
        let observableSubscriber = this
            .prepareStateMachineUpdates(componentName, stateMachineName)
            .subscribe(jsonData => stateMachineUpdateListener(jsonData));
        this
            .observableSubscribers
            .push(observableSubscriber);
        this.sendSubscribeRequest(componentName, stateMachineName);
    };

    sendSubscribeRequest(componentName: string, stateMachineName: string) {
        if (!this.isSubscribed(this.subscribedStateMachines, componentName, stateMachineName)) {
            const componentCode = this.configuration.getComponentCode(componentName);
            const stateMachineCode = this.configuration.getStateMachineCode(componentName, stateMachineName);
            let topic = this.configuration.getSubscriberTopic(componentCode, stateMachineCode, SubscriberEventType.Update);
            let kind = Kinds.Public;
            this.sendSubscribeRequestToTopic(topic, kind);
            this.addSubscribedStateMachines(componentName, stateMachineName);
        }
    };

    sendSubscribeRequestToTopic(topic: string, kind: number) {
        let data = this.getDataToSend(topic, kind);
        this
            .webSocket
            .send(this.convertToWebsocketInputFormat(Commands[Commands.subscribe], data));
    };

    sendUnsubscribeRequestToTopic(topic: string, kind: number) {
        let data = this.getDataToSend(topic, kind);
        this
            .webSocket
            .send(this.convertToWebsocketInputFormat(Commands[Commands.unsubscribe], data));
    };

    getDataToSend(topic: string, kind: number) {
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

    unsubscribe(componentName: string, stateMachineName: string) {
        if (this.isSubscribed(this.subscribedStateMachines, componentName, stateMachineName)) {
            const componentCode = this.configuration.getComponentCode(componentName);
            const stateMachineCode = this.configuration.getStateMachineCode(componentName, stateMachineName);
            let topic = this.configuration.getSubscriberTopic(componentCode, stateMachineCode, SubscriberEventType.Update);
            let kind = Kinds.Public;
            let data = this.getDataToSend(topic, kind);
            this.webSocket.send(this.convertToWebsocketInputFormat(Commands[Commands.unsubscribe], data));
            this.removeSubscribedStateMachines(componentName, stateMachineName);
        }
    };

    private isSubscribed(subscribedStateMachines: any, componentName: any, stateMachineName: string) {
        let isSubscribed = subscribedStateMachines[componentName] !== undefined && subscribedStateMachines[componentName].indexOf(stateMachineName) > -1;
        return isSubscribed;
    }

    dispose() {
        for (let i = 0; i < this.observableSubscribers.length; i++) {
            this
                .observableSubscribers[i]
                .dispose();
        }
        this.observableSubscribers = [];
    };

    addSubscribedStateMachines(componentName: string, stateMachineName: string) {
        if (this.subscribedStateMachines[componentName] === undefined) {
            this.subscribedStateMachines[componentName] = [stateMachineName];
        } else {
            this
                .subscribedStateMachines[componentName]
                .push(stateMachineName);
        }
    };

    removeSubscribedStateMachines(componentName: string, stateMachineName: string) {
        let index = this
            .subscribedStateMachines[componentName]
            .indexOf(stateMachineName);
        this
            .subscribedStateMachines[componentName]
            .splice(index, 1);
    };


    getJsonDataFromEvent(data: string) {
        let jsonData = this.getJsonData(data);
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
                thisObject.replyPublisher.sendWithStateMachineRef(this, messageType, jsonMessage, visibilityPrivate, undefined);
            }
        };
        return {
            stateMachineRef: stateMachineRef,
            jsonMessage: JSON.parse(jsonData.JsonMessage)
        };
    };

    getJsonDataFromSnapshot(data: string) {
        let jsonData = this.getJsonData(data);
        let b64Data = JSON.parse(jsonData.JsonMessage).Items;
        let items;
        try {
            items = JSON.parse(this.decodeServerMessage(b64Data));
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
                    thisObject.replyPublisher.sendWithStateMachineRef(this, messageType, jsonMessage, visibilityPrivate, undefined);
                }
            };
            snapshotItems.push({
                stateMachineRef: stateMachineRef,
                jsonMessage: items[i].PublicMember
            });
        }
        return snapshotItems;
    };

    private getJsonDataFromGetModelRequest(stringData: string) {
        let jsonData = this.getJsonData(stringData);
        let components = [];
        let zippedComponents = jsonData.ModelContent.Components;
        for (let i = 0; i < zippedComponents.length; i++) {
            components.push({
                name: zippedComponents[i].Name,
                content: this.decodeServerMessage(zippedComponents[i].Content)
            });
        }
        return {
            projectName: jsonData.ModelContent.ProjectName,
            components: components,
            composition: this.decodeServerMessage(jsonData.ModelContent.Composition)
        };
    }

    private decodeServerMessage(b64Data: string) {
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

    private getJsonDataFromXcApiRequest(data) {
        let jsonData = this.getJsonData(data);
        return this.decodeServerMessage(jsonData.Content);
    };

    private getJsonDataFromGetXcApiListRequest(data) {
        let jsonData = this.getJsonData(data);
        return jsonData.Apis;
    };

    private getJsonData(data: string) {
        return JSON.parse(data.substring(data.indexOf("{"), data.lastIndexOf("}") + 1));
    }

    private convertToWebsocketInputFormat(command: string, data: any) {
        let input = command + " " + JSON.stringify(data);
        return input;
    }

    private deserialize(data) {
        let s = data.split(" ");
        let command = s.splice(0, 1)[0];
        let topic = s.splice(0, 1)[0];
        let stringData = s.join("");
        return {
            command: command,
            topic: topic,
            stringData: stringData
        };
    }

    private deserializeWithoutTopic(data) {
        let s = data.split(" ");
        let command = s.splice(0, 1)[0];
        let stringData = s.join("");
        return {
            command: command,
            stringData: stringData
        };
    }

}

export default Subscriber;