
define(["communication/xcWebSocketPublisher", "../spec/mock/xcWebSocketPublisherMock"], function (Publisher, Mock) {


    describe("Test xcWebSocketPublisher module", function () {

        describe("Test getEventToSend method", function () {
            var publisher;
            beforeEach(function () {
                publisher = new Publisher(Mock.createMockWebSocket(), Mock.configuration);
            });

            it("should return event with routing details (how to route the message to the right stateMachine)", function () {
                var data = publisher.getEventToSend("componentName", "stateMachineName", Mock.jsonMessage);
                expect(data).toEqual(Mock.correctData);
            });
        });


        describe("Test send method", function () {
            var publisher;
            beforeEach(function () {
                publisher = new Publisher(Mock.createMockWebSocket(), Mock.configuration);
            });

            it("sould send a message to the given stateMachine and component", function () {
                publisher.send("componentName", "stateMachineName", Mock.jsonMessage);
                expect(publisher.webSocket.send).toHaveBeenCalledTimes(1);
                expect(publisher.webSocket.send).toHaveBeenCalledWith(Mock.corretWebsocketInputFormat);
            });
        });

    });
});
