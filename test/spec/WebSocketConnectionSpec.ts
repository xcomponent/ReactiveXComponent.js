import { XComponent } from "../../src/XComponent";
import { WebSocket, Server, SocketIO } from "mock-socket";
import { WebSocketConnection } from "../../src/communication/WebSocketConnection";
import { Connection } from "../../src/interfaces/Connection";
import { ErrorListener } from "../../src/interfaces/ErrorListener";
import Mock from "./mock/mockSubscriberDependencies";
import pako = require("pako");
import { log } from "util";

let uuid = require("uuid/v4");

const encodeServerMessage = (strData: string) => {
    let binaryString = pako.deflate(strData, { to: "string" });

    return window.btoa(binaryString);
};

describe("Test Connection module", function () {

    beforeEach(function () {
        (<any>window).WebSocket = WebSocket;
        (<any>window).isTestEnvironnement = true;
    });

    describe("Test createSession method", function () {
        it("given an unknown server url, should call the error listener", function (done) {
            let serverUrl = "wss://wrongServerUrl";
            const connection = new XComponent().connect(serverUrl, new FakeErrorHandler((err) => done()));
        });

        it("should call the sessionListener with the created session as argument", function (done) {
            let serverUrl = "wss://serverUrl";
            let mockServer = new Server(serverUrl);
            let xcApiFileName = "api.xcApi";
            new XComponent().connect(serverUrl)
            .then(connection => {
                connection.createSession(xcApiFileName)
                .then(session => {
                    expect(session).not.toBe(null);
                    mockServer.stop(done);
                });
            });

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
            let serverUrl = "wss://serverUrl1";
            let mockServer = new Server(serverUrl);
            let xcApiFileName = "unknownApi";

            new XComponent().connect(serverUrl)
            .then(connection => {
                connection.createSession(xcApiFileName)
                .catch(error => {
                    // it refers explicitly to the unknown Api on the error message, not to some random crash
                    expect(error.message).toMatch(xcApiFileName);
                    mockServer.stop(done);
                });
            });

            mockServer.on("connection", function (server) {
                server.on("message", function (message) {
                    let data = { ApiFound: false, ApiName: xcApiFileName };
                    server.send("getXcApi " + JSON.stringify(data));
                });
            });
        });
        it("when server stops after running in the first place, unexpectedCloseSessionErrorListener should be called", (done) => {
            const serverUrl = "wss://serverUrl";
            const mockServer = new Server(serverUrl);
            const xcApiFileName = "api.xcApi";
            mockServer.on("connection", (server) => {
                mockServer.close();
            });
            new XComponent().connect(serverUrl, new FakeErrorHandler((err) => done()))
            .then(connection => {
                connection.createSession(xcApiFileName);
            });
        });
    });

    describe("Test close method", function () {
        beforeEach(function () {
        it("should call onclose method when connection is disposed", function ( done) {
            let serverUrl = "wss:\\serverUrl";
            new XComponent().connect(serverUrl)
                .then(connection => {
                    connection.webSocket.onclose = function (e) {
                        done();
                    };
                    connection.dispose();
                });
            });
        });
    });

    describe("Test getModel method", function () {
        let mockServer, serverUrl;
        beforeEach(function () {
            serverUrl = "wss://" + uuid();
            mockServer = Mock.createMockServer(serverUrl);
        });

        it("send getModel request, getModelListener callback should be executed when a response is received", function (done) {
            new XComponent().connect(serverUrl)
            .then(connection => {
                let apiName = "unknownApi";
                connection.getCompositionModel(apiName).then((compositionModel) => {
                    expect(compositionModel.projectName).not.toBe(null);
                    expect(compositionModel.components).not.toBe(null);
                    expect(compositionModel.composition).not.toBe(null);
                    mockServer.stop(done);
                });
            });

            mockServer.on("connection", function (server) {
                server.on("message", function (message) {
                    server.send(Mock.getModelResponse);
                });
            });

        });

    });
});

class FakeErrorHandler implements ErrorListener{
    constructor(private done) {
    }

    onError(err: Error) {
        this.done();
    }
}