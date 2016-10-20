
define(["communication/xcWebSocketSubscriber", "../spec/mock/mockSubscriberDependencies", "rx", "guid"], function (Subscriber, Mock, Rx, Guid) {


    describe("Test xcWebSocketSubscriber module", function () {


        describe("Test subscribe method", function () {
            var subscriber, mockServer, mockWebSocket;
            beforeEach(function () {
                var serverUrl = "wss://" + (new Guid()).create();
                mockServer = Mock.createMockServer(serverUrl);
                mockWebSocket = Mock.createMockWebSocket(serverUrl);
                subscriber = new Subscriber(mockWebSocket, Mock.configuration);
            });

            it("subscribe to a state machine, subscriberListener callback should be executed when a message is received", function (done) {
                mockWebSocket.onopen = function (e) {
                    var stateMachineUpdateListener = function (data) {
                        expect(data.stateMachineRef.ComponentCode).toEqual(Mock.correctReceivedData.stateMachineRef.ComponentCode);
                        expect(data.stateMachineRef.StateMachineCode).toEqual(Mock.correctReceivedData.stateMachineRef.StateMachineCode);
                        expect(data.stateMachineRef.AgentId).toEqual(Mock.correctReceivedData.stateMachineRef.AgentId);
                        expect(data.stateMachineRef.StateName).toEqual(Mock.correctReceivedData.stateMachineRef.StateName);
                        expect(data.stateMachineRef.send).toEqual(jasmine.any(Function));
                        expect(data.jsonMessage).toEqual(Mock.correctReceivedData.jsonMessage);
                        done();
                    };
                    //subscribe send a message (subscribe request)
                    subscriber.subscribe("component", "stateMachine", stateMachineUpdateListener);
                }

                mockServer.on('connection', function (server) {
                    //when subscribe request is received, we send send jsonData
                    server.on('message', function (subscribeRequest) {
                        expect(subscribeRequest).toEqual(Mock.correctSubscribeRequest);
                        server.send();
                        server.send(JSON.stringify(Mock.jsonData));
                    });
                });

            });

            it("can subscribe method : return true if subscriber exists and false otherwise", function () {
                subscriber.canSubscribe("RandomComponent", "RandomStateMachine");
                expect(Mock.configuration.subscriberExist).toHaveBeenCalledWith("RandomComponent", "RandomStateMachine");
            });
        });


        describe("Test unsubscribe method", function () {
            var subscriber, mockWebSocket;
            var componentName = "componentName", stateMachineName = "stateMachineName";
            beforeEach(function () {
                mockWebSocket = Mock.createWebSocket();
                subscriber = new Subscriber(mockWebSocket, Mock.configuration);
            });

            it("unsubscribe to a subscribed state machine", function () {
                subscriber.addSubscribedStateMachines(componentName, stateMachineName);
                subscriber.unsubscribe(componentName, stateMachineName);
                expect(subscriber.webSocket.send).toHaveBeenCalledTimes(1);
                expect(subscriber.webSocket.send).toHaveBeenCalledWith(Mock.correctUnsubscribeRequest);
            });

        });


        describe("Test getStateMachineUpdates method", function () {
            var subscriber, mockWebSocket;
            beforeEach(function () {
                mockWebSocket = Mock.createWebSocket();
                subscriber = new Subscriber(mockWebSocket, Mock.configuration);
            });

            it("get an observable collection from a subscribed state machine", function () {
                var observable = subscriber.getStateMachineUpdates();
                expect(subscriber.webSocket.send).toHaveBeenCalledTimes(1);
                expect(subscriber.webSocket.send).toHaveBeenCalledWith(Mock.correctSubscribeRequest);
            });
        });



        describe("Test getSnapshot method", function () {
            var subscriber, mockServer, mockWebSocket;
            beforeEach(function () {
                var serverUrl = "wss://" + (new Guid()).create();
                mockServer = Mock.createMockServer(serverUrl);
                mockWebSocket = Mock.createMockWebSocket(serverUrl);
                subscriber = new Subscriber(mockWebSocket, Mock.configuration, null, Mock.guid);
            });

            it("send snapshot request, snapshotListener callback should be executed when a response is received", function (done) {
                mockWebSocket.onopen = function (e) {
                    var snapshotListener = function (items) {
                        done();
                    }
                    subscriber.getSnapshot("component", "stateMachine", snapshotListener);
                }

                mockServer.on('connection', function (server) {
                    server.on('message', function (snapshotRequest) {
                        expect(snapshotRequest).toEqual(Mock.correctSnapshotRequest);
                        server.send();
                        server.send(Mock.snapshotResponse);
                    });
                });
            });

        });


    });

});
