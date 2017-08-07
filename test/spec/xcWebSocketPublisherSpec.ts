import { DefaultPublisher } from "../../src/communication/xcWebSocketPublisher";
import Mock from "./mock/mockPublisherDependencies";

describe("Test xcWebSocketPublisher module", function () {

    beforeEach(function () {
        (<any>window).isTestEnvironnement = true;
    });

    describe("Test send method", function () {
        var publisher;
        beforeEach(function () {
            publisher = new DefaultPublisher(Mock.createMockWebSocket(), Mock.configuration, Mock.guiExample, Mock.sessionData);
        });

        it("should send a message to the given stateMachine and component", function () {
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
            publisher = new DefaultPublisher(Mock.createMockWebSocket(), Mock.configuration, Mock.guiExample, Mock.sessionData);
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
            publisher = new DefaultPublisher(Mock.createMockWebSocket(), Mock.configuration, Mock.guiExample, Mock.sessionData);
        });

        it("should return true if there is a publisher details and false otherwise", function () {
            expect(publisher.canPublish()).toBe(false);
            expect(publisher.canPublish("componentName", "stateMachineName")).toBe(true);
        });
    });

});