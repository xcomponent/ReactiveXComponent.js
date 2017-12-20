import { WebSocket, Server, SocketIO } from "mock-socket";
import { WebSocketPublisher } from "../../src/communication/WebSocketPublisher";
import { WebSocketSubscriber } from "../../src/communication/WebSocketSubscriber";
import { WebSocketSession } from "../../src/communication/WebSocketSession";


describe("Test xcSession module", function () {

    describe("Add private topic / SetPrivateTopic", function () {
        it("should not trigger server subscription on undefined topic", () => {
            const serverUrl = "wss:\\serverUrl";
            let mockWebSocket: any = {};
            mockWebSocket.send = jest.fn();
            const session = new WebSocketSession(mockWebSocket, null);
            session.privateTopics.setDefaultPublisherTopic(undefined);
            session.privateTopics.addSubscriberTopic(undefined);
            expect(mockWebSocket.send).toHaveBeenCalledTimes(0);
        });

        it("Should add and set correctly the given private topics", () => {
            const serverUrl = "wss:\\serverUrl";
            let mockWebSocket = new WebSocket(serverUrl);
            const session = new WebSocketSession(mockWebSocket, null);
            const privateTopic = "privateTopic";
            const anotherPrivateTopic = "anotherPrivateTopic";
            session.privateTopics.setDefaultPublisherTopic(privateTopic);
            expect(session.privateTopics.getdefaultPublisherTopic()).toEqual(privateTopic);
            session.privateTopics.addSubscriberTopic(anotherPrivateTopic);
            expect(session.privateTopics.getSubscriberTopics()).toEqual([privateTopic, anotherPrivateTopic]);
        });

    });

});
