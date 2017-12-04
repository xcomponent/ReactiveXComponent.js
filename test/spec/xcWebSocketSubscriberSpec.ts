import { DefaultSubscriber, Subscriber } from "../../src/communication/xcWebSocketSubscriber";
import { Deserializer, Serializer } from "../../src/communication/xcomponentMessages";
import Rx = require("rx");
import Mock from "./mock/mockSubscriberDependencies";
import { EventEmitter } from "events";

let uuid = require("uuid/v4");

describe("Test xcWebSocketSubscriber module", function () {

    beforeEach(function () {
        (<any>window).isTestEnvironnement = true;
    });

    describe("Test subscribe method", function () {
        let subscriber, mockServer, mockWebSocket;
        beforeEach(function () {
            let serverUrl = "wss://" + uuid();
            mockServer = Mock.createMockServer(serverUrl);
            mockWebSocket = Mock.createMockWebSocket(serverUrl);
            subscriber = new DefaultSubscriber(mockWebSocket, Mock.configuration, undefined, undefined);
        });

        it("subscribe to a state machine, subscriberListener callback should be executed when a message is received", function (done) {
            mockWebSocket.onopen = function (e) {
                let stateMachineUpdateListener = function (data) {
                    expect(data.stateMachineRef.ComponentCode).toEqual(Mock.correctReceivedData.stateMachineRef.ComponentCode);
                    expect(data.stateMachineRef.StateMachineCode).toEqual(Mock.correctReceivedData.stateMachineRef.StateMachineCode);
                    expect(data.stateMachineRef.StateName).toEqual(Mock.correctReceivedData.stateMachineRef.StateName);
                    expect(data.stateMachineRef.send).toEqual(jasmine.any(Function));
                    expect(data.jsonMessage).toEqual(Mock.correctReceivedData.jsonMessage);
                    mockServer.stop(done);
                };
                // subscribe send a message (subscribe request)
                subscriber.subscribe("component", "stateMachine", stateMachineUpdateListener);
            };

            mockServer.on("connection", function (server) {
                // when subscribe request is received, we send send jsonData
                server.on("message", function (subscribeRequest) {
                    expect(subscribeRequest).toEqual(Mock.correctSubscribeRequest);
                    server.send(Mock.updateResponse);
                });
            });

        });

        it("can subscribe method : return true if subscriber exists and false otherwise", function () {
            subscriber.canSubscribe("RandomComponent", "RandomStateMachine");
            expect(Mock.configuration.containsSubscriber).toHaveBeenCalledWith(-69981087, -829536631, 0);
        });
    });


    describe("Test unsubscribe method", function () {
        let subscriber, mockWebSocket;
        let componentName = "componentName",
            stateMachineName = "stateMachineName";
        beforeEach(function () {
            mockWebSocket = Mock.createWebSocket();
            subscriber = new DefaultSubscriber(mockWebSocket, Mock.configuration, undefined, undefined);
        });

        it("unsubscribe to a subscribed state machine", function () {
            subscriber.addSubscribedStateMachines(componentName, stateMachineName);
            subscriber.unsubscribe(componentName, stateMachineName);
            expect(subscriber.webSocket.send).toHaveBeenCalledTimes(1);
            expect(subscriber.webSocket.send).toHaveBeenCalledWith(Mock.correctUnsubscribeRequest);
        });

    });


    describe("Test getStateMachineUpdates method", function () {

        it("should receive jsonData updates on ObservableCollection", function () {
            return new Promise((resolve, reject) => {
                let mockWebSocket: any = new EventEmitter();
                mockWebSocket.send = jest.fn();
                const subscriber = new DefaultSubscriber(mockWebSocket, Mock.configuration, undefined, undefined);

                let observable = subscriber.getStateMachineUpdates("componentName", "stateMachineName");

                expect(mockWebSocket.send).toHaveBeenCalledTimes(1);
                expect(mockWebSocket.send).toHaveBeenCalledWith(Mock.correctSubscribeRequest);
                observable.subscribe(jsonData => {
                    expect(jsonData.stateMachineRef).toBeDefined();
                    expect(jsonData.stateMachineRef.StateName).toEqual("stateName");
                    expect(jsonData.jsonMessage).toBeDefined();
                    resolve();
                });

                mockWebSocket.emit("message", { data: Mock.updateResponse });
            });
        });
    });



    describe("Test getSnapshot method", function () {
        let subscriber, mockServer, mockWebSocket;
        beforeEach(function () {
            let serverUrl = "wss://" + uuid();
            mockServer = Mock.createMockServer(serverUrl);
            mockWebSocket = Mock.createMockWebSocket(serverUrl);
            subscriber = new DefaultSubscriber(mockWebSocket, Mock.configuration, null, [Mock.privateTopic]);
        });

        it("send snapshot request, promise resolve method should be executed when a response is received", function (done) {
            let deserializer = new Deserializer();

            mockServer.on("connection", function (server) {
                let n = 0;
                let topic: string = undefined;

                server.on("message", function (message) {
                    switch (n) {
                        case 0: {
                            const deserializedMessage = deserializer.deserializeWithoutTopic(message);
                            const jsonData = deserializer.getJsonData(deserializedMessage.stringData);
                            const jsonMessage = JSON.parse(jsonData.JsonMessage);

                            topic = jsonMessage.Topic.Key;

                            expect(deserializedMessage.command).toBe("subscribe");
                            expect(jsonData.Header.IncomingEventType).toBe(0);
                            expect(jsonMessage.Topic.Key).not.toBeUndefined();
                            expect(jsonMessage.Topic.kind).toBe(1);

                            n++;
                            break;
                        }
                        case 1: {
                            n++;

                            expect(message.startsWith(`${Mock.snapshotTopic} ${Mock.componentCode}`)).toBeTruthy();

                            const jsonData = deserializer.getJsonData(message);
                            const jsonMessage = JSON.parse(jsonData.JsonMessage);
                            expect(jsonData.Header.IncomingEventType).toBe(0);
                            expect(jsonData.Header.StateMachineCode).toBe(Mock.stateMachineCode);
                            expect(jsonData.Header.ComponentCode).toBe(Mock.componentCode);
                            expect(jsonMessage.ReplyTopic).toBe(topic);
                            expect(jsonMessage.CallerPrivateTopic[0]).toBe(Mock.privateTopic);
                            server.send(`snapshot ${topic} ${JSON.stringify(Mock.snapshotResponseData)}`);
                            break;
                        }
                        case 2: {
                            expect(message.startsWith("unsubscribe")).toBeTruthy();
                            n++;
                            break;
                        }
                    }
                });
            });
            mockWebSocket.onopen = function (e) {
                subscriber.getSnapshot("component", "stateMachine")
                    .then(items => mockServer.stop(done))
                    .catch(err => {
                        console.error(err);
                    });
            };
        });

    });


    describe("Test getModel method", function () {
        let subscriber, mockServer, mockWebSocket;
        beforeEach(function () {
            let serverUrl = "wss://" + uuid();
            mockServer = Mock.createMockServer(serverUrl);
            mockWebSocket = Mock.createMockWebSocket(serverUrl);
            subscriber = new DefaultSubscriber(mockWebSocket, null, null, null);
        });

        it("send getModel request, getModelListener callback should be executed when a response is received", function (done) {
            mockWebSocket.onopen = function (e) {
                let apiName = "xcApi";
                subscriber.getCompositionModel(apiName).then((compositionModel) => {
                    expect(compositionModel.projectName).not.toBe(null);
                    expect(compositionModel.components).not.toBe(null);
                    expect(compositionModel.composition).not.toBe(null);
                    mockServer.stop(done);
                });
            };

            mockServer.on("connection", function (server) {
                server.on("message", function (message) {
                    server.send(Mock.getModelResponse);
                });
            });

        });

    });

    describe("Test getXcApi method", function () {
        let subscriber, mockServer, mockWebSocket;
        beforeEach(function () {
            let serverUrl = "wss://" + uuid();
            mockServer = Mock.createMockServer(serverUrl);
            mockWebSocket = Mock.createMockWebSocket(serverUrl);
            subscriber = new DefaultSubscriber(mockWebSocket, null, null, null);
        });

        it("returns null when Api is not found", function (done) {
            mockWebSocket.onopen = function (e) {
                let apiName = "unknownApi";
                subscriber.getXcApi(apiName)
                .then(xcApi => {
                    expect(xcApi).toBe(null);
                    mockServer.stop(done);
                });
            };

            mockServer.on("connection", function (server) {
                server.on("message", function (message) {
                    server.send(Mock.getXcApiNotFoundResponse);
                });
            });

        });

    });
});
