
define(["communication/xcWebSocketPublisher"], function (Publisher) {


    describe("Test xcWebSocketPublisher module", function () {


        /***********************************************************************************************/
        /************************Mocking and Initialisation*********************************************/
        /***********************************************************************************************/
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

        var webSocket = jasmine.createSpyObj('webSocket', ['send']);

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

        /***********************************************************************************************/
        /************************End Mocking and Initialisation*****************************************/
        /***********************************************************************************************/
        var publisher;

        beforeEach(function () {
            publisher = new Publisher(webSocket, configuration);
        });


        describe("Test getEventToSend method", function () {
            it("should return event with data to route the message to the right stateMachine", function () {
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
    });

});
