
define(["mock-socket", "communication/xcWebSocketSubscriber"], function (MockSocket, Subscriber) {


    describe("Test xcWebSocketSubscriber module", function () {

        // Mocking and Initialisation
        var configuration = jasmine.createSpyObj('configuration', ['getSubscriberTopic', 'getCodes']);
        configuration.getSubscriberTopic.and.callFake(function (componentName, stateMachineName) {
            return "output.1_0.HelloWorldMicroservice.HelloWorld.HelloWorldResponse";
        });
        var componentCode = "-69981087";
        var stateMachineCode = "-829536631";
        configuration.getCodes.and.callFake(function (componentName, stateMachineName) {
            return {
                componentCode: componentCode,
                stateMachineCode: stateMachineCode
            };
        });
        
        var webSocket = jasmine.createSpyObj('webSocket', ['send']);

        var correctData = {
            "Header": { "IncomingType": 0 },
            "JsonMessage": JSON.stringify({ "Topic": { "Key": "output.1_0.HelloWorldMicroservice.HelloWorld.HelloWorldResponse" } })
        };

        var corretWebsocketInputFormat = "subscribe " + JSON.stringify(correctData);


        describe("Test getEventToSend method", function () {
            var subscriber;  
            beforeEach(function () {
                subscriber = new Subscriber(webSocket, configuration);
            });

            it("should return event with routing details (how to route the message to the right stateMachine)", function () {
                var data = subscriber.getjsonDataToSendSusbcribeRequest("component", "stateMachine");
                expect(data).toEqual(correctData);
            });
        });


        describe("Test subscribe method", function () {
            var subscriber, mockServer, mockWebSocket;
            beforeEach(function () {
                var serverUrl = "wss://testSubscriber";
                mockServer = new MockServer(serverUrl);
                mockWebSocket = new MockWebSocket(serverUrl);
                subscriber = new Subscriber(mockWebSocket, configuration);
            });

            it("subscribe to a state machine, subscriberListener callback should be executed when a message is received", function (done) {
                //jsonData should pass the filter
                var jsonMessage = "JsonMessage";
                var jsonData = {
                    Header: {
                        ComponentCode: { Fields: [componentCode] },
                        StateMachineCode: { Fields: [stateMachineCode] },
                        StateMachineId: "",
                        AgentId: "",
                        JsonMessage: jsonMessage
                    }
                };
                var correctReceivedData = {
                    stateMachineRef: {
                        "StateMachineId": jsonData.Header.StateMachineId,
                        "AgentId": jsonData.Header.AgentId,
                        "StateMachineCode": jsonData.Header.StateMachineCode,
                        "ComponentCode": jsonData.Header.ComponentCode
                    },
                    JsonMessage: jsonData.JsonMessage
                };
                mockWebSocket.onopen = function (e) {
                    var stateMachineUpdateListener = function (data) {
                        expect(data).toEqual(correctReceivedData);
                        done();
                    };
                    //subscribe send a message (subscribe request)
                    subscriber.subscribe("component", "stateMachine", stateMachineUpdateListener);
                }
                
                mockServer.on('connection', function (server) {
                    //when subscribe request is received, we send send jsonData
                    server.on('message', function (susbcribeRequest) {
                        var correctSubscribeRequest = "subscribe " + JSON.stringify(correctData);
                        expect(susbcribeRequest).toEqual(correctSubscribeRequest);
                        server.send(JSON.stringify(jsonData));
                    });
                });

            });
        });

    });

});
