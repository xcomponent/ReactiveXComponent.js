import { WebSocket, Server, SocketIO } from "mock-socket";
import { Publisher, DefaultPublisher } from "communication/xcWebSocketPublisher";
import Subscriber from "communication/xcWebSocketSubscriber";
import { DefaultSession } from "communication/xcSession";


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
            expect(subscriber instanceof Subscriber).toBe(true);
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
    });

});