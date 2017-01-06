import { WebSocket, Server, SocketIO } from "mock-socket";
import Connection from "communication/xcConnection";
import pako = require("pako");

const encodeServerMessage =  (strData: string) => {
    let binaryString = pako.deflate(strData, { to: "string" });

    return window.btoa(binaryString);
};

describe("Test xcConnection module", function () {

    let connection;

    beforeEach(function () {
        (<any>window).WebSocket = WebSocket;
        connection = new Connection();
    });

    describe("Test createSession method", function () {
        it("given an unknown server url, should call the session listener with an error argument", function (done) {
            let serverUrl = "wss://wrongServerUrl";
            let messageError = "Error on " + serverUrl + ".";

            let sessionListener = function (error, session) {
                expect(error).toEqual(messageError);
                expect(session).toBe(null);
                done();
            };
            connection.createSession("xcApiFileName", serverUrl, sessionListener);
        });

        it("should call the sessionListener with the created session as argument", function (done) {
            let serverUrl = "wss://serverUrl";
            let mockServer = new Server(serverUrl);
            let xcApiFileName = "api.xcApi";
            let sessionListener = function (error, session) {
                expect(error).toBe(null);
                expect(session).not.toBe(null);
                done();
            };

            connection.createSession(xcApiFileName, serverUrl, sessionListener);
            mockServer.on("connection", function (server) {
                server.on("message", function (message) {
                    let content = encodeServerMessage("<test/>");
                    let data = { ApiFound: true, ApiName: xcApiFileName, Content: content };
                    server.send("getXcApi " + JSON.stringify(data));
                });
            });
        });
    });

});