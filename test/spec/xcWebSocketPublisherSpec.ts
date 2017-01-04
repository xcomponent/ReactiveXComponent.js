import Publisher from "communication/xcWebSocketPublisher";
import Mock from "./mock/mockPublisherDependencies";

describe("Test xcWebSocketPublisher module", function () {

    describe("Test getEventToSend method", function () {
        var publisher;
        beforeEach(function () {
            publisher = new Publisher(Mock.createMockWebSocket(), Mock.configuration, Mock.guiExample, Mock.sessionData);
        });

        it("should return event with routing details (how to route the message to the right stateMachine)", function () {
            var data = publisher.getEventToSend("componentName", "stateMachineName", Mock.messageType, Mock.jsonMessage);
            expect(data).toEqual(Mock.correctData);
        });
    });


    describe("Test send method", function () {
        var publisher;
        beforeEach(function () {
            publisher = new Publisher(Mock.createMockWebSocket(), Mock.configuration, Mock.guiExample, Mock.sessionData);
        });

        it("sould send a message to the given stateMachine and component", function () {
            publisher.send("componentName", "stateMachineName", Mock.messageType, Mock.jsonMessage);
            expect(publisher.webSocket.send).toHaveBeenCalledTimes(1);
            expect(publisher.webSocket.send).toHaveBeenCalledWith(Mock.getCorretWebsocketInputFormat(false));
        });

        it("sould send a message in a priavte topic to the given stateMachine and component", function () {
            publisher.send("componentName", "stateMachineName", Mock.messageType, Mock.jsonMessage, true);
            expect(publisher.webSocket.send).toHaveBeenCalledTimes(1);
            expect(publisher.webSocket.send).toHaveBeenCalledWith(Mock.getCorretWebsocketInputFormat(true));
        });

    });

    describe("Test sendWithStateMachineRef", function () {
        var publisher;
        beforeEach(function () {
            publisher = new Publisher(Mock.createMockWebSocket(), Mock.configuration, Mock.guiExample, Mock.sessionData);
        });

        it("sould send a message to the given instance of stateMachine", function () {
            publisher.sendWithStateMachineRef(Mock.stateMachineRef, Mock.messageType, Mock.jsonMessage);
            expect(publisher.webSocket.send).toHaveBeenCalledTimes(1);
            expect(publisher.webSocket.send).toHaveBeenCalledWith(Mock.corretWebsocketInputFormatForSendSMRef);
        });
    });

    describe("Test canPublish", function () {
        var publisher;
        beforeEach(function () {
            publisher = new Publisher(Mock.createMockWebSocket(), Mock.configuration, Mock.guiExample, Mock.sessionData);
        });

        it("should return true if there is a publisher details and false otherwise", function () {
            expect(publisher.canPublish()).toBe(false);
            expect(publisher.canPublish("componentName", "stateMachineName")).toBe(true);
        });
    });

});