import { WebSocket } from "mock-socket";
import { WebSocketSubscriber } from "../../src/communication/WebSocketSubscriber";
import { Deserializer } from "../../src/communication/xcomponentMessages";
import Mock from "./mock/mockSubscriberDependencies";
import { EventEmitter } from "events";
import { PrivateTopics } from "../../src/interfaces/PrivateTopics";
import * as uuid from "uuid/v4";
import { verify, instance, mock, anything } from "../../node_modules/ts-mockito/lib/ts-mockito";
import { WebSocketWrapper } from "../../src/communication/WebSocketWrapper";

describe("Test xcWebSocketSubscriber module", function () {

    beforeEach(function () {
        (<any>window).WebSocket = WebSocket;
        (<any>window).isTestEnvironnement = true;
    });

    describe("Test subscribe method", function () {
        let subscriber, mockServer, mockWebSocket;
        beforeEach(function () {
            let serverUrl = "wss://" + uuid();
            mockServer = Mock.createMockServer(serverUrl);
            mockWebSocket = new WebSocket(serverUrl);
            subscriber = new WebSocketSubscriber(new WebSocketWrapper(mockWebSocket), Mock.configuration);
        });

        it("subscribe to a state machine, subscriberListener callback should be executed when a message is received", function (done) {
            mockWebSocket.onopen = function (e) {
                let stateMachineUpdateListener = function (data) {
                    expect(data.stateMachineRef.ComponentCode).toEqual(Mock.correctReceivedData.stateMachineRef.ComponentCode);
                    expect(data.stateMachineRef.StateMachineCode).toEqual(Mock.correctReceivedData.stateMachineRef.StateMachineCode);
                    expect(data.stateMachineRef.StateName).toEqual(Mock.correctReceivedData.stateMachineRef.StateName);
                    expect(data.stateMachineRef.send).toEqual(expect.any(Function));
                    expect(data.jsonMessage).toEqual(Mock.correctReceivedData.jsonMessage);
                    mockServer.stop(done);
                };
                // subscribe send a message (subscribe request)
                subscriber.subscribe("component", "stateMachine", { onStateMachineUpdate: stateMachineUpdateListener });
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
            verify(Mock.configurationMocker.containsSubscriber(-69981087, -829536631, 0)).once();
        });
    });


    describe("Test unsubscribe method", function () {
        let subscriber, webSocketMocker;
        let componentName = "componentName",
            stateMachineName = "stateMachineName";
        beforeEach(function () {
            webSocketMocker = mock(WebSocketWrapper);
            subscriber = new WebSocketSubscriber(instance(webSocketMocker), Mock.configuration);
        });

        it("unsubscribe to a subscribed state machine", function () {
            subscriber.addSubscribedStateMachines(componentName, stateMachineName);
            subscriber.unsubscribe(componentName, stateMachineName);
            verify(webSocketMocker.send(anything())).once();
            verify(webSocketMocker.send(Mock.correctUnsubscribeRequest)).once();
        });

    });


    describe("Test getStateMachineUpdates method", function () {

        it("should receive jsonData updates on ObservableCollection", function () {
            return new Promise((resolve, reject) => {
                let mockWebSocket: any = new EventEmitter();
                mockWebSocket.send = jest.fn();
                const subscriber = new WebSocketSubscriber(new WebSocketWrapper(mockWebSocket), Mock.configuration);

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
        let subscriber, mockServer, mockWebSocket, privateTopics;
        beforeEach(function () {
            let serverUrl = "wss://" + uuid();
            mockServer = Mock.createMockServer(serverUrl);
            mockWebSocket = new WebSocket(serverUrl);
            subscriber = new WebSocketSubscriber(new WebSocketWrapper(mockWebSocket), Mock.configuration);
            privateTopics = new PrivateTopics(subscriber);
            privateTopics.setDefaultPublisherTopic(Mock.privateTopic);
        });

        it("send snapshot request, promise resolve method should be executed when a response is received", function (done) {
            let deserializer = new Deserializer();

            mockServer.on("connection", function (server) {
                let n = -3;
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

                            break;
                        }
                        case 1: {

                            expect(message.startsWith(`${Mock.snapshotTopic} ${Mock.componentCode}`)).toBeTruthy();

                            const jsonData = deserializer.getJsonData(message);
                            const jsonMessage = JSON.parse(jsonData.JsonMessage);
                            expect(jsonData.Header.IncomingEventType).toBe(0);
                            expect(jsonData.Header.StateMachineCode).toBe(Mock.stateMachineCode);
                            expect(jsonData.Header.ComponentCode).toBe(Mock.componentCode);
                            expect(jsonMessage.ReplyTopic).toBe(topic);
                            server.send(`snapshot ${topic} ${JSON.stringify(Mock.snapshotResponseData)}`);
                            break;
                        }
                        case 2: {
                            expect(message.startsWith("unsubscribe")).toBeTruthy();
                            break;
                        }
                    }

                    n++;
                });
            });
            mockWebSocket.onopen = function (e) {
                subscriber.getSnapshot("component", "stateMachine", privateTopics)
                    .then(items => mockServer.stop(done))
                    .catch(err => {
                        console.error(err);
                    });
            };
        });

    });
});