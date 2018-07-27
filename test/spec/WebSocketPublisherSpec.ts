import { WebSocketPublisher } from "../../src/communication/WebSocketPublisher";
import Mock from "./mock/mockPublisherDependencies";
import { PrivateTopics } from "../../src/interfaces/PrivateTopics";
import { WebSocketSubscriber } from "../../src/communication/WebSocketSubscriber";
import { verify, anything, mock, instance } from "../../node_modules/ts-mockito/lib/ts-mockito";
import { WebSocketWrapper } from "../../src/communication/WebSocketWrapper";

describe("Test xcWebSocketPublisher module", function () {

    beforeEach(function () {
        (<any>window).isTestEnvironnement = true;
    });

    describe("Test send method", function () {
        let publisher, privateTopics, webSocketWrapper;
        beforeEach(function () {
            webSocketWrapper = mock(WebSocketWrapper);
            const webSocket = instance(webSocketWrapper);
            const webSocketSubscriber = new WebSocketSubscriber(webSocket, Mock.configuration);
            privateTopics = new PrivateTopics(webSocketSubscriber);
            publisher = new WebSocketPublisher(webSocket, Mock.configuration, privateTopics, Mock.sessionData);
        });

        it("should send a message to the given stateMachine and component", function () {
            publisher.send("componentName", "stateMachineName", Mock.messageType, Mock.jsonMessage);
            verify(webSocketWrapper.send(anything())).twice();
            verify(webSocketWrapper.send(Mock.getCorretWebsocketInputFormat(false))).once();
        });

        it("sould send a message in a private topic to the given stateMachine and component", function () {
            privateTopics.setDefaultPublisherTopic(Mock.guiExample);
            publisher.send("componentName", "stateMachineName", Mock.messageType, Mock.jsonMessage, true);
            verify(webSocketWrapper.send(anything())).times(4);
            verify(webSocketWrapper.send(Mock.getCorretWebsocketInputFormat(true))).once();
        });

    });

    describe("Test sendWithStateMachineRef", function () {
        let publisher, webSocketWrapper;
        beforeEach(function () {
            webSocketWrapper = mock(WebSocketWrapper);
            const webSocket = instance(webSocketWrapper);
            const webSocketSubscriber = new WebSocketSubscriber(webSocket, Mock.configuration);
            publisher = new WebSocketPublisher(webSocket, Mock.configuration, new PrivateTopics(webSocketSubscriber), Mock.sessionData);
        });

        it("sould send a message to the given instance of stateMachine", function () {
            publisher.sendWithStateMachineRef(Mock.stateMachineRef, Mock.messageType, Mock.jsonMessage);

            verify(webSocketWrapper.send(anything())).twice();
            verify(webSocketWrapper.send(Mock.corretWebsocketInputFormatForSendSMRef)).once();
        });
    });

    describe("Test canSend", function () {
        let publisher;
        beforeEach(function () {
            const webSocket = instance(mock(WebSocketWrapper));
            const webSocketSubscriber = new WebSocketSubscriber(webSocket, Mock.configuration);
            publisher = new WebSocketPublisher(webSocket, Mock.configuration, new PrivateTopics(webSocketSubscriber), Mock.sessionData);
        });

        it("should return true if there is a publisher details and false otherwise", function () {
            expect(publisher.canSend("", "", "")).toBe(false);
            expect(publisher.canSend("componentName", "stateMachineName", "")).toBe(true);
        });
    });

});