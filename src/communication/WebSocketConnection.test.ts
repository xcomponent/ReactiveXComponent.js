import { XComponent } from '../../src/XComponent';
import { WebSocket, Server } from 'mock-socket';
import { ErrorListener } from '../../src/interfaces/ErrorListener';
import Mock from '../utils/mockSubscriberDependencies';
import pako = require('pako');
import * as uuid from 'uuid/v4';

const encodeServerMessage = (strData: string) => {
    let binaryString = pako.deflate(strData, { to: 'string' });

    return window.btoa(binaryString);
};

describe('Test Connection module', function() {
    let mockServer: Server;

    beforeEach(function() {
        // tslint:disable-next-line:no-any
        (<any>window).WebSocket = WebSocket;
        // tslint:disable-next-line:no-any
        (<any>window).isTestEnvironnement = true;
    });

    afterEach(() => {
        if (mockServer) {
            mockServer.stop(() => {
                /**/
            });
        }
    });

    describe('Test createSession method', function() {
        it('should call the sessionListener with the created session as argument', function(done: jest.DoneCallback) {
            let serverUrl = 'wss://serverUrl';
            mockServer = new Server(serverUrl);
            let xcApiFileName = 'api.xcApi';
            new XComponent()
                .connect(serverUrl)
                .then(connection => {
                    return connection.createSession(xcApiFileName);
                })
                .then(session => {
                    expect(session).not.toBe(null);
                    mockServer.stop(done);
                })
                .catch(err => {
                    console.log(err);
                });

            // tslint:disable-next-line:no-any
            mockServer.on('connection', function(server: any) {
                server.on('message', function() {
                    const getApiResponse = `<deployment>
                                                    <clientAPICommunication>
                                                    </clientAPICommunication>
                                                    <codesConverter>
                                                    </codesConverter>
                                                </deployment>`;
                    let content = encodeServerMessage(getApiResponse);
                    let data = { ApiFound: true, ApiName: xcApiFileName, Content: content };
                    server.send('getXcApi ' + JSON.stringify(data));
                });
            });
        });

        it('should provide meaningful error message when the Api is unknown', function(done: jest.DoneCallback) {
            let serverUrl = 'wss://serverUrl1';
            mockServer = new Server(serverUrl);
            let xcApiFileName = 'unknownApi';

            new XComponent().connect(serverUrl).then(connection => {
                connection.createSession(xcApiFileName).catch(error => {
                    // it refers explicitly to the unknown Api on the error message, not to some random crash
                    expect(error.message).toMatch(xcApiFileName);
                    mockServer.stop(done);
                });
            });

            // tslint:disable-next-line:no-any
            mockServer.on('connection', function(server: any) {
                server.on('message', function() {
                    let data = { ApiFound: false, ApiName: xcApiFileName };
                    server.send('getXcApi ' + JSON.stringify(data));
                });
            });
        });

        it('when server stops after running in the first place, unexpectedCloseSessionErrorListener should be called', (done: jest.DoneCallback) => {
            const serverUrl = 'wss://serverUrl';
            mockServer = new Server(serverUrl);
            const xcApiFileName = 'api.xcApi';
            mockServer.on('connection', server => {
                mockServer.close(undefined);
            });
            new XComponent()
                .connect(
                    serverUrl,
                    new FakeErrorHandler(err => done())
                )
                .then(connection => {
                    connection.createSession(xcApiFileName);
                })
                .catch(error => {
                    /**/
                });
        });

        // tslint:disable-next-line:typedef
        it('given an unknown server url, should call the error listener', function(done) {
            let serverUrl = 'wss://wrongServerUrl';
            new XComponent()
                .connect(
                    serverUrl,
                    new FakeErrorHandler(err => done())
                )
                .catch(error => {
                    /**/
                });
        });
    });

    describe('Test getModel method', function() {
        let serverMock: Server, serverUrl: string;
        beforeEach(function() {
            serverUrl = 'wss://' + uuid();
            serverMock = new Server(serverUrl);
        });

        it('send getModel request, getModelListener callback should be executed when a response is received', function(done: jest.DoneCallback) {
            new XComponent().connect(serverUrl).then(connection => {
                let apiName = 'unknownApi';
                connection.getCompositionModel(apiName).then(compositionModel => {
                    expect(compositionModel.projectName).not.toBe(null);
                    expect(compositionModel.components).not.toBe(null);
                    expect(compositionModel.composition).not.toBe(null);
                    serverMock.stop(done);
                });
            });

            // tslint:disable-next-line:no-any
            serverMock.on('connection', function(server: any) {
                server.on('message', function() {
                    server.send(Mock.getModelResponse);
                });
            });
        });

        it('send getModel request, getModelListener callback should be executed and receive undefined model and undefined graphical', function(done: jest.DoneCallback) {
            new XComponent().connect(serverUrl).then(connection => {
                let apiName = 'unknownApi';
                connection.getCompositionModel(apiName).catch(() => {
                    serverMock.stop(done);
                });
            });

            // tslint:disable-next-line:no-any
            serverMock.on('connection', function(server: any) {
                server.on('message', function() {
                    server.send(Mock.getModelResponseUndefined);
                });
            });
        });
    });
});

class FakeErrorHandler implements ErrorListener {
    // tslint:disable-next-line:typedef
    constructor(private done) {}

    onError(err: Error) {
        this.done();
    }
}
