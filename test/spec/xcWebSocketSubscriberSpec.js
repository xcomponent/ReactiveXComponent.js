
define(["communication/xcWebSocketSubscriber", "../spec/mock/xcWebSocketSubscriberMock"], function (Subscriber, Mock) {


    describe("Test xcWebSocketSubscriber module", function () {


        describe("Test getEventToSend method", function () {
            var subscriber;  
            beforeEach(function () {
                subscriber = new Subscriber(Mock.webSocket, Mock.configuration);
            });

            it("should return event with routing details (how to route the message to the right stateMachine)", function () {
                var data = subscriber.getjsonDataToSendSusbcribeRequest("component", "stateMachine");
                expect(data).toEqual(Mock.correctData);
            });
        });


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
                        expect(data).toEqual(Mock.correctReceivedData);
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

    });

});
