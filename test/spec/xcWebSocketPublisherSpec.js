
define(["communication/xcWebSocketPublisher"], function (Publisher) {


    describe("Test xcWebSocketPublisher module", function () {


        // Mocking and Initialisation
        var configuration = jasmine.createSpyObj('configuration', ['getCodes', 'getPublisherDetails']);
        configuration.getCodes.and.callFake(function (componentName, stateMachineName) {
            return {
                componentCode: "-69981087",
                stateMachineCode: "-829536631"
            };
        });

        configuration.getPublisherDetails.and.callFake(function (componentCode, stateMachineCode) {
            return {
                eventCode: "9",
                messageType: "XComponent.HelloWorld.UserObject.SayHello",
                routingKey: "input.1_0.HelloWorldMicroservice.HelloWorld.HelloWorldManager"
            };
        });


        var jsonMessage = { "Name": "MY NAME" };
        var correctData = {
            event: {
                "Header": {
                    "StateMachineCode": { "Case": "Some", "Fields": [-829536631] },
                    "ComponentCode": { "Case": "Some", "Fields": [-69981087] },
                    "EventCode": 9,
                    "IncomingType": 0,
                    "MessageType": { "Case": "Some", "Fields": ["XComponent.HelloWorld.UserObject.SayHello"] }
                },
                "JsonMessage": JSON.stringify(jsonMessage)
            },
            routingKey: "input.1_0.HelloWorldMicroservice.HelloWorld.HelloWorldManager"
        };
        var corretWebsocketInputFormat = correctData.routingKey + " " + correctData.event.Header.ComponentCode.Fields[0]
             + " " + JSON.stringify(correctData.event);

        var stateMachineRef = {
            "AgentId": { "Case": "Some", "Fields": [0] },
            "StateMachineId": { "Case": "Some", "Fields": [0] },
            "StateMachineCode": { "Case": "Some", "Fields": [-829536631] },
            "ComponentCode": { "Case": "Some", "Fields": [-69981087] },
        };
        var correctDataForSendContext = {
            event: {
                "Header": {
                    "AgentId": stateMachineRef.AgentId,
                    "StateMachineId": stateMachineRef.StateMachineId,
                    "StateMachineCode": stateMachineRef.StateMachineCode,
                    "ComponentCode": stateMachineRef.ComponentCode,
                    "EventCode": 9,
                    "IncomingType": 0,
                    "MessageType": { "Case": "Some", "Fields": ["XComponent.HelloWorld.UserObject.SayHello"] }
                },
                "JsonMessage": JSON.stringify(jsonMessage)
            },
            routingKey: "input.1_0.HelloWorldMicroservice.HelloWorld.HelloWorldManager"
        };
        var corretWebsocketInputFormatForSendContext = correctDataForSendContext.routingKey + " " + correctDataForSendContext.event.Header.ComponentCode.Fields[0]
             + " " + JSON.stringify(correctDataForSendContext.event);

        var webSocket, publisher;

        beforeEach(function () {
            webSocket = jasmine.createSpyObj('webSocket', ['send']);
            publisher = new Publisher(webSocket, configuration);
        });


        describe("Test getEventToSend method", function () {
            it("should return event with routing details (how to route the message to the right stateMachine)", function () {
                var data = publisher.getEventToSend(null, null, jsonMessage);
                expect(data).toEqual(correctData);
            });
        });


        describe("Test send method", function() {
            it("sould send a message to the given stateMachine and component", function () {
                publisher.send("componentName", "stateMachineName", jsonMessage);
                expect(webSocket.send).toHaveBeenCalledTimes(1);
                expect(webSocket.send).toHaveBeenCalledWith(corretWebsocketInputFormat);
            });
        });


        describe("Test getEventToSendContext method", function () {
            it("should return event with routing details (how to route the message to the right stateMachine instance and to the right agent)", function () {
                var data = publisher.getEventToSendContext(stateMachineRef, jsonMessage);
                expect(data).toEqual(correctDataForSendContext);
            });
        });


        describe("Test sendContext method", function () {
            it("sould send a message to the specific instance of a stateMachine", function () {
                publisher.sendContext(stateMachineRef, jsonMessage);
                expect(webSocket.send).toHaveBeenCalledTimes(1);
                expect(webSocket.send).toHaveBeenCalledWith(corretWebsocketInputFormatForSendContext);
            });
        });

    });

});
