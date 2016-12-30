import { WebSocket, Server, SocketIO } from "mock-socket";
import Connection from "communication/xcConnection";


describe("Test xcConnection module", function () {

    let connection;

    beforeEach(function () {
        window["WebSocket"] = WebSocket;
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
                    let content = "H4sIAAAAAAAAAwXB2w0AEBAEwFbWl2Y0IW4jQmziPNo3k6TuGK0Tj/ESVRs6yzkuHRnGIqPB92qzhg8yp62UMAAAAA==";
                    let data = { ApiFound: true, ApiName: xcApiFileName, Content: content };
                    server.send("getXcApi " + JSON.stringify(data));
                });
            });
        });
    });

});