import { WebSocket, Server, SocketIO } from "mock-socket";
import { Publisher, DefaultPublisher } from "../../src/communication/xcWebSocketPublisher";
import { Subscriber, DefaultSubscriber } from "../../src/communication/xcWebSocketSubscriber";
import { DefaultSession } from "../../src/communication/xcSession";


describe("Test xcSession module", function () {

    describe("Test createPublisher method", function () {
        let session;
        beforeEach(function () {
            let serverUrl = "wss:\\serverUrl";
            let mockWebSocket = new WebSocket(serverUrl);
            session = new DefaultSession(serverUrl, mockWebSocket, null, null);
        });

        it("should return a new instance of Publisher", function () {
            let publisher = session.createPublisher();
            expect(publisher instanceof DefaultPublisher).toBe(true);
        });

    });

    describe("Test createSubscriber method", function () {
        let session;
        beforeEach(function () {
            let serverUrl = "wss:\\serverUrl";
            let mockWebSocket = new WebSocket(serverUrl);
            session = new DefaultSession(serverUrl, mockWebSocket, null, null);
        });
        it("should return a new instance of Subscriber", function () {
            let subscriber = session.createSubscriber();
            expect(subscriber instanceof DefaultSubscriber).toBe(true);
        });
    });

    describe("Test close method", function () {
        let session;
        beforeEach(function () {
            let serverUrl = "wss:\\serverUrl";
            let mockWebSocket = new WebSocket(serverUrl);
            session = new DefaultSession(serverUrl, mockWebSocket, null, null);
        });
        it("should call onclose method when session is closed", function (done) {
            session.webSocket.onclose = function (e) {
                done();
            };
            session.close();
        });
    });

    describe("Add private topic / SetPrivateTopic", function () {
        it("should not trigger server subscription on undefined topic", () => {
            const serverUrl = "wss:\\serverUrl";
            let mockWebSocket: any = {};
            mockWebSocket.send = jest.fn();
            const session = new DefaultSession(serverUrl, mockWebSocket, null, null);
            session.setPrivateTopic(undefined);
            session.addPrivateTopic(undefined);
            expect(mockWebSocket.send).toHaveBeenCalledTimes(0);
        });

        it("Should add and set correctly the given private topics", () => {
            const serverUrl = "wss:\\serverUrl";
            let mockWebSocket = new WebSocket(serverUrl);
            const session = new DefaultSession(serverUrl, mockWebSocket, null, null);
            const privateTopic = "privateTopic";
            const anotherPrivateTopic = "anotherPrivateTopic";
            session.setPrivateTopic(privateTopic);
            expect(session.getDefaultPrivateTopic()).toEqual(privateTopic);
            session.addPrivateTopic(anotherPrivateTopic);
            expect(session.getPrivateTopics()).toEqual([privateTopic, anotherPrivateTopic]);
        });

    });

});
