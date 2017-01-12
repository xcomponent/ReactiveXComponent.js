import { WebSocket, Server, SocketIO } from "mock-socket";
import Publisher from "communication/xcWebSocketPublisher";
import Subscriber from "communication/xcWebSocketSubscriber";
import {Session} from "communication/xcSession";

import XCWebSsocket from "communication/WebSocket";

describe("Test xcSession module", function () {

    describe("Test createPublisher method", function () {
        let session;
        beforeEach(function () {
            let serverUrl = "wss:\\serverUrl";
            window["WebSocket"] = WebSocket;
            let mockWebSocket = new XCWebSsocket(serverUrl);            
            session = new Session(serverUrl, mockWebSocket, null, null);
        });

        it("should return a new instance of Publisher", function () {
            let publisher = session.createPublisher();
            expect(publisher instanceof Publisher).toBe(true);
        });

    });

    describe("Test createSubscriber method", function () {
        let session;
        beforeEach(function () {
            let serverUrl = "wss:\\serverUrl";
            window["WebSocket"] = WebSocket;
            let mockWebSocket = new XCWebSsocket(serverUrl);            
            session = new Session(serverUrl, mockWebSocket, null, null);
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
            window["WebSocket"] = WebSocket;
            let mockWebSocket = new XCWebSsocket(serverUrl);            
            session = new Session(serverUrl, mockWebSocket, null, null);
        });
        it("should call onclose method when session is closed", function (done) {
            session.webSocket.setEventListener('onclose', function (e) {
                done();
            });
            session.close();
        });
    });

});