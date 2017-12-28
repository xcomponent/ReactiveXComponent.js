import { WebSocketPublisher } from "../../src/communication/WebSocketPublisher";
import Mock from "./mock/mockPublisherDependencies";
import { PrivateTopics } from "../../src/interfaces/PrivateTopics";

describe("Test xcWebSocketPublisher module", function () {

    beforeEach(function () {
        (<any>window).isTestEnvironnement = true;
    });

    describe("Test send method", function () {
        var publisher, privateTopics;
        privateTopics = new PrivateTopics();
        beforeEach(function () {
            publisher = new WebSocketPublisher(Mock.createMockWebSocket(), Mock.configuration, privateTopics, Mock.sessionData);
        });

        it("should send a message to the given stateMachine and component", function () {
            publisher.send("componentName", "stateMachineName", Mock.messageType, Mock.jsonMessage);
            expect(publisher.webSocket.send).toHaveBeenCalledTimes(1);
            expect(publisher.webSocket.send).toHaveBeenCalledWith(Mock.getCorretWebsocketInputFormat(false));
        });

        it("sould send a message in a private topic to the given stateMachine and component", function () {
            privateTopics.setDefaultPublisherTopic(Mock.guiExample);
            publisher.send("componentName", "stateMachineName", Mock.messageType, Mock.jsonMessage, true);
            expect(publisher.webSocket.send).toHaveBeenCalledTimes(1);
            expect(publisher.webSocket.send).toHaveBeenCalledWith(Mock.getCorretWebsocketInputFormat(true));
        });

    });

    describe("Test sendWithStateMachineRef", function () {
        var publisher;
        beforeEach(function () {
            publisher = new WebSocketPublisher(Mock.createMockWebSocket(), Mock.configuration, new PrivateTopics(), Mock.sessionData);
        });

        it("sould send a message to the given instance of stateMachine", function () {
            publisher.sendWithStateMachineRef(Mock.stateMachineRef, Mock.messageType, Mock.jsonMessage);
            expect(publisher.webSocket.send).toHaveBeenCalledTimes(1);
            expect(publisher.webSocket.send).toHaveBeenCalledWith(Mock.corretWebsocketInputFormatForSendSMRef);
        });
    });

    describe("Test canSend", function () {
        var publisher;
        beforeEach(function () {
            publisher = new WebSocketPublisher(Mock.createMockWebSocket(), Mock.configuration, new PrivateTopics(), Mock.sessionData);
        });

        it("should return true if there is a publisher details and false otherwise", function () {
            expect(publisher.canSend()).toBe(false);
            expect(publisher.canSend("componentName", "stateMachineName")).toBe(true);
        });
    });

});