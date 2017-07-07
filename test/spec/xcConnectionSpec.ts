import { WebSocket, Server, SocketIO } from "mock-socket";
import { Connection, DefaultConnection } from "../../src/communication/xcConnection";
import pako = require("pako");

const encodeServerMessage = (strData: string) => {
    let binaryString = pako.deflate(strData, { to: "string" });

    return window.btoa(binaryString);
};

describe("Test xcConnection module", function () {

    let connection;

    beforeEach(function () {
        (<any>window).WebSocket = WebSocket;
        (<any>window).isTestEnvironnement = true;
        connection = new DefaultConnection();
    });

    describe("Test createSession method", function () {
        it("given an unknown server url, should call the session listener with an error argument", function (done) {
            let serverUrl = "wss://wrongServerUrl";

            let sessionListener = function (error, session) {
                expect(error).not.toBe(null);
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
                mockServer.stop(done);
            };
            connection.createSession(xcApiFileName, serverUrl, sessionListener);
            mockServer.on("connection", function (server) {
                server.on("message", function (message) {
                    const getApiResponse = `<deployment>  
                                                    <clientAPICommunication>   
                                                    </clientAPICommunication>
                                                    <codesConverter>   
                                                    </codesConverter>
                                                </deployment>`;
                    let content = encodeServerMessage(getApiResponse);
                    let data = { ApiFound: true, ApiName: xcApiFileName, Content: content };
                    server.send("getXcApi " + JSON.stringify(data));
                });
            });
        });

        it("should provide meaningful error message when the Api is unknown", function (done) {
            let serverUrl = "wss://serverUrl";
            let mockServer = new Server(serverUrl);
            let xcApiFileName = "unknownApi";

            let sessionListener = function (error, session) {
                // it refers explicitly to the unknown Api on the error message, not to some random crash
                expect(error.message).toMatch(xcApiFileName);
                mockServer.stop(done);
            };

            connection.createSession(xcApiFileName, serverUrl, sessionListener);

            mockServer.on("connection", function (server) {
                server.on("message", function (message) {
                    let data = { ApiFound: false, ApiName: xcApiFileName };
                    server.send("getXcApi " + JSON.stringify(data));
                });
            });
        });

        it("when server stops after running in the first place, disconnectionErrorListener should be called", (done) => {
            let serverUrl = "wss://serverUrl";
            let mockServer = new Server(serverUrl);
            let xcApiFileName = "xcApiFileName";

            let sessionListener = (error, session) => {
                mockServer.close();
            };

            let disconnectionErrorListener = (closeEvent) => {
                done();
            };

            connection.createSession(xcApiFileName, serverUrl, sessionListener, disconnectionErrorListener);

            mockServer.on("connection", (server) => {
                server.on("message", (message) => {
                    const getApiResponse = `<deployment>  
                                                    <clientAPICommunication>   
                                                    </clientAPICommunication>
                                                    <codesConverter>   
                                                    </codesConverter>
                                                </deployment>`;
                    let content = encodeServerMessage(getApiResponse);
                    let data = { ApiFound: true, ApiName: xcApiFileName, Content: content };
                    server.send("getXcApi " + JSON.stringify(data));
                });
            });

        });

    });

});