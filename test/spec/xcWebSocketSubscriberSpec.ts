import Subscriber from "communication/xcWebSocketSubscriber";
import Rx = require("rx");
import Guid from "guid";
import Mock from "./mock/mockSubscriberDependencies";
import { EventEmitter } from "events";

describe("Test xcWebSocketSubscriber module", function () {


    describe("Test subscribe method", function () {
        let subscriber, mockServer, mockWebSocket;
        beforeEach(function () {
            let serverUrl = "wss://" + (new Guid()).create();
            mockServer = Mock.createMockServer(serverUrl);
            mockWebSocket = Mock.createMockWebSocket(serverUrl);
            subscriber = new Subscriber(mockWebSocket, Mock.configuration, undefined, undefined, undefined);
        });

        it("subscribe to a state machine, subscriberListener callback should be executed when a message is received", function (done) {
            mockWebSocket.onopen = function (e) {
                let stateMachineUpdateListener = function (data) {
                    expect(data.stateMachineRef.ComponentCode).toEqual(Mock.correctReceivedData.stateMachineRef.ComponentCode);
                    expect(data.stateMachineRef.StateMachineCode).toEqual(Mock.correctReceivedData.stateMachineRef.StateMachineCode);
                    expect(data.stateMachineRef.AgentId).toEqual(Mock.correctReceivedData.stateMachineRef.AgentId);
                    expect(data.stateMachineRef.StateName).toEqual(Mock.correctReceivedData.stateMachineRef.StateName);
                    expect(data.stateMachineRef.send).toEqual(jasmine.any(Function));
                    expect(data.jsonMessage).toEqual(Mock.correctReceivedData.jsonMessage);
                    done();
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
            subscriber = new Subscriber(mockWebSocket, Mock.configuration, undefined, undefined, undefined);
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
                const subscriber = new Subscriber(mockWebSocket, Mock.configuration, undefined, undefined, undefined);

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
            let serverUrl = "wss://" + (new Guid()).create();
            mockServer = Mock.createMockServer(serverUrl);
            mockWebSocket = Mock.createMockWebSocket(serverUrl);
            subscriber = new Subscriber(mockWebSocket, Mock.configuration, null, Mock.guid, Mock.privateTopics);
        });

        it("send snapshot request, snapshotListener callback should be executed when a response is received", function (done) {
            mockServer.on("connection", function (server) {
                let n = 0;
                server.on("message", function (message) {
                    switch (n) {
                        case 0:
                            expect(message).toEqual(Mock.snapshotSubscribeRequest);
                            n++;
                            break;
                        case 1:
                            n++;
                            expect(message).toEqual(Mock.correctSnapshotRequest);
                            server.send(Mock.snapshotResponse);
                            break;
                        case 2:
                            expect(message).toEqual(Mock.snapshotUnsubscribeRequest);
                            n++;
                            break;
                    }
                });
            });
            mockWebSocket.onopen = function (e) {
                let snapshotListener = function (items) {
                    done();
                };
                subscriber.getSnapshot("component", "stateMachine", snapshotListener);
            };
        });

    });


    describe("Test getModel method", function () {
        let subscriber, mockServer, mockWebSocket;
        beforeEach(function () {
            let serverUrl = "wss://" + (new Guid()).create();
            mockServer = Mock.createMockServer(serverUrl);
            mockWebSocket = Mock.createMockWebSocket(serverUrl);
            subscriber = new Subscriber(mockWebSocket, null, null, null, null);
        });

        it("send getModel request, modelListener callback should be executed when a response is received", function (done) {
            mockWebSocket.onopen = function (e) {
                let apiName = "xcApi";                
                subscriber.getModel(apiName, function (model) {
                    expect(model.projectName).not.toBe(null);
                    expect(model.components).not.toBe(null);
                    expect(model.composition).not.toBe(null);
                    done();
                });
            };

            mockServer.on("connection", function (server) {
                server.on("message", function (message) {
                    server.send(Mock.getModelResponse);
                });
            });

        });

    });

});