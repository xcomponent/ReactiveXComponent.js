
define(["communication/connection", "xcomponentAPI"], function (Connection, XComponentAPI) {

    describe("Test XComponentAPI module", function () {

        
        /*var parser = jasmine.createSpyObj('parser', ['getCodes', 'getPublish']);
        parser.getCodes.and.callFake(function (componentName, stateMachineName) {
            return {
                componentCode: "-69981087",
                stateMachineCode: "-829536631"
            };
        });

        parser.getPublish.and.callFake(function (componentCode, stateMachineCode) {
            return {
                eventCode: "9",
                messageType: "XComponent.HelloWorld.UserObject.SayHello",
                routingKey: "input.1_0.HelloWorldMicroservice.HelloWorld.HelloWorldManager"
            };
        });

       
        var url = "wss://localhost:443";
        var jsonMessage = { "Name": "Test XcomponentAPI module" };
        var connection = jasmine.createSpyObj('connection', ['getUrl', 'send', 'getSession']);
        connection.getUrl.and.callFake(function () {
            return url;
        });

        var api = new XComponentAPI.Init(connection, parser);

        var componentName = "HelloWorld";
        var stateMachineName = "HelloWrldManager";

        var correctEvent = {
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

        var correctStringToSend = correctEvent.routingKey + " " + correctEvent.event.Header.ComponentCode.Fields[0]
                    + " " + JSON.stringify(correctEvent.event);


        it("Test XcomponentAPI getEventToSend", function () {
            var event = api.getEventToSend(componentName, stateMachineName, jsonMessage);
            expect(event).toEqual(correctEvent);

            expect(parser.getCodes).toHaveBeenCalledTimes(1);
            expect(parser.getCodes).toHaveBeenCalledWith(componentName, stateMachineName);

            expect(parser.getPublish).toHaveBeenCalledTimes(1);
            expect(parser.getPublish).toHaveBeenCalledWith("-69981087", "-829536631");
        });


        it("Test XcomponentAPI send", function() {
            expect(api.send(componentName, stateMachineName, jsonMessage)).toBe(true);
            expect(connection.send).toHaveBeenCalledTimes(1);
            expect(connection.send).toHaveBeenCalledWith(correctStringToSend);
        });

        it("Test XcomponentAPI send error", function () {
            var api = new XComponentAPI.Init();
            expect(api.send()).toBe(false);
        });*/
    });

});
