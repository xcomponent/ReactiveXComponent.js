
define(["communication/xcWebSocketSubscriber", "../spec/mock/mockSubscriberDependencies"], function (Subscriber, Mock) {


    describe("Test xcWebSocketSubscriber module", function () {


        describe("Test subscribe method", function () {
            var subscriber, mockServer, mockWebSocket;
            beforeEach(function () {
                var serverUrl = "wss://testSubscriber";
                mockServer = Mock.createMockServer(serverUrl);
                mockWebSocket = Mock.createMockWebSocket(serverUrl);
                subscriber = new Subscriber(mockWebSocket, Mock.configuration);
            });

            it("subscribe to a state machine, subscriberListener callback should be executed when a message is received", function (done) {
                mockWebSocket.onopen = function (e) {
                    var stateMachineUpdateListener = function (data) {
                        expect(data.stateMachineRef.ComponentCode).toEqual(Mock.correctReceivedData.stateMachineRef.ComponentCode);
                        expect(data.stateMachineRef.StateMachineCode).toEqual(Mock.correctReceivedData.stateMachineRef.StateMachineCode);
                        expect(data.stateMachineRef.send).toEqual(jasmine.any(Function));
                        expect(data.jsonMessage).toEqual(Mock.correctReceivedData.jsonMessage);
                        done();
                    };
                    //subscribe send a message (subscribe request)
                    subscriber.subscribe("component", "stateMachine", stateMachineUpdateListener);
                }
                
                mockServer.on('connection', function (server) {
                    //when subscribe request is received, we send send jsonData
                    server.on('message', function (susbcribeRequest) {
                        expect(susbcribeRequest).toEqual(Mock.correctSubscribeRequest);
                        server.send(JSON.stringify(Mock.jsonData));
                    });
                });

            });
        });


        describe("Test sendWithStateMachineRef method", function () {
            var subscriber, webSocket;
            beforeEach(function () {
                webSocket = Mock.createWebSocket();
                subscriber = new Subscriber(webSocket, Mock.configuration);
            });

            it("should return event with routing details (how to route the message to the right instance of stateMachine)", function () {
                subscriber.sendWithStateMachineRef(Mock.jsonData, Mock.jsonMessage);
                expect(webSocket.send).toHaveBeenCalledWith(Mock.correctInputToWebSocket);
            });
        });
    });

});
