import { WebSocket, Server } from 'mock-socket';
import { WebSocketSubscriber } from '../../src/communication/WebSocketSubscriber';
import { Deserializer } from '../../src/communication/xcomponentMessages';
import Mock from '../utils/mockSubscriberDependencies';
import { EventEmitter } from 'events';
import { PrivateTopics } from '../../src/interfaces/PrivateTopics';
import * as uuid from 'uuid/v4';
import { verify, instance, mock, anything } from '../../node_modules/ts-mockito/lib/ts-mockito';
import { WebSocketWrapper } from '../../src/communication/WebSocketWrapper';

describe('Test xcWebSocketSubscriber module', function() {
    beforeEach(function() {
        // tslint:disable-next-line:no-any
        (<any>window).WebSocket = WebSocket;
        // tslint:disable-next-line:no-any
        (<any>window).isTestEnvironnement = true;
    });

    describe('Test subscribe method', function() {
        let subscriber, mockServer: Server, mockWebSocket;
        beforeEach(function() {
            let serverUrl = 'wss://' + uuid();
            mockServer = new Server(serverUrl);
            mockWebSocket = new WebSocket(serverUrl);
            subscriber = new WebSocketSubscriber(new WebSocketWrapper(mockWebSocket), Mock.configuration);
        });

        it('subscribe to a state machine, subscriberListener callback should be executed when a message is received', function(done: jest.DoneCallback) {
            mockWebSocket.onopen = function() {
                // tslint:disable-next-line:no-any
                let stateMachineUpdateListener = function(data: any) {
                    expect(data.stateMachineRef.ComponentCode).toEqual(
                        Mock.correctReceivedData.stateMachineRef.ComponentCode
                    );
                    expect(data.stateMachineRef.StateMachineCode).toEqual(
                        Mock.correctReceivedData.stateMachineRef.StateMachineCode
                    );
                    expect(data.stateMachineRef.StateName).toEqual(Mock.correctReceivedData.stateMachineRef.StateName);
                    expect(data.stateMachineRef.send).toEqual(expect.any(Function));
                    expect(data.jsonMessage).toEqual(Mock.correctReceivedData.jsonMessage);
                    mockServer.stop(done);
                };
                // subscribe send a message (subscribe request)
                subscriber.subscribe('component', 'stateMachine', { onStateMachineUpdate: stateMachineUpdateListener });
            };

            // tslint:disable-next-line:no-any
            mockServer.on('connection', function(server: any) {
                // when subscribe request is received, we send send jsonData
                // tslint:disable-next-line:no-any
                server.on('message', function(subscribeRequest: any) {
                    expect(subscribeRequest).toEqual(Mock.correctSubscribeRequest);
                    server.send(Mock.updateResponse);
                });
            });
        });

        it('can subscribe method : return true if subscriber exists and false otherwise', function() {
            subscriber.canSubscribe('RandomComponent', 'RandomStateMachine');
            verify(Mock.configurationMocker.containsSubscriber(-69981087, -829536631, 0)).once();
        });
    });

    describe('Test unsubscribe method', function() {
        let subscriber, webSocketMocker;
        let componentName = 'componentName',
            stateMachineName = 'stateMachineName';
        beforeEach(function() {
            webSocketMocker = mock(WebSocketWrapper);
            subscriber = new WebSocketSubscriber(instance(webSocketMocker), Mock.configuration);
        });

        it('unsubscribe to a subscribed state machine', function() {
            subscriber.addSubscribedStateMachines(componentName, stateMachineName);
            subscriber.unsubscribe(componentName, stateMachineName);
            verify(webSocketMocker.send(anything())).once();
            verify(webSocketMocker.send(Mock.correctUnsubscribeRequest)).once();
        });
    });

    describe('Test getStateMachineUpdates method', function() {
        it('should receive jsonData updates on ObservableCollection', function() {
            return new Promise((resolve, reject) => {
                // tslint:disable-next-line:no-any
                let mockWebSocket: any = new EventEmitter();
                mockWebSocket.send = jest.fn();
                const subscriber = new WebSocketSubscriber(new WebSocketWrapper(mockWebSocket), Mock.configuration);

                let observable = subscriber.getStateMachineUpdates('componentName', 'stateMachineName');

                expect(mockWebSocket.send).toHaveBeenCalledTimes(1);
                expect(mockWebSocket.send).toHaveBeenCalledWith(Mock.correctSubscribeRequest);
                observable.subscribe(jsonData => {
                    expect(jsonData.stateMachineRef).toBeDefined();
                    expect(jsonData.stateMachineRef.StateName).toEqual('stateName');
                    expect(jsonData.jsonMessage).toBeDefined();
                    resolve();
                });

                mockWebSocket.emit('message', { data: Mock.updateResponse });
            });
        });
    });

    describe('Test getSnapshot method', function() {
        let subscriber, mockServer: Server, mockWebSocket, privateTopics;
        beforeEach(function() {
            let serverUrl = 'wss://' + uuid();
            mockServer = new Server(serverUrl);
            mockWebSocket = new WebSocket(serverUrl);
            subscriber = new WebSocketSubscriber(new WebSocketWrapper(mockWebSocket), Mock.configuration);
            privateTopics = new PrivateTopics(subscriber);
            privateTopics.setDefaultPublisherTopic(Mock.privateTopic);
        });

        it('send snapshot request, promise resolve method should be executed when a response is received', function(done: jest.DoneCallback) {
            let deserializer = new Deserializer();

            // tslint:disable-next-line:no-any
            mockServer.on('connection', function(server: any) {
                let n = -3;
                let topic: string = '';

                // tslint:disable-next-line:no-any
                server.on('message', function(message: any) {
                    switch (n) {
                        case 0: {
                            const deserializedMessage = deserializer.deserializeWithoutTopic(message);
                            const jsonData = deserializer.getJsonData(deserializedMessage.stringData);
                            const jsonMessage = JSON.parse(jsonData.JsonMessage);

                            topic = jsonMessage.Topic.Key;

                            expect(deserializedMessage.command).toBe('subscribe');
                            expect(jsonData.Header.IncomingEventType).toBe(0);
                            expect(jsonMessage.Topic.Key).not.toBeUndefined();
                            expect(jsonMessage.Topic.kind).toBe(1);

                            break;
                        }
                        case 1: {
                            expect(message.startsWith(`${Mock.snapshotTopic} ${Mock.componentCode}`)).toBeTruthy();

                            const jsonData = deserializer.getJsonData(message);
                            const jsonMessage = JSON.parse(jsonData.JsonMessage);
                            expect(jsonData.Header.IncomingEventType).toBe(0);
                            expect(jsonData.Header.StateMachineCode).toBe(Mock.stateMachineCode);
                            expect(jsonData.Header.ComponentCode).toBe(Mock.componentCode);
                            expect(jsonMessage.ReplyTopic).toBe(topic);
                            server.send(`snapshot ${topic} ${JSON.stringify(Mock.snapshotResponseData)}`);
                            break;
                        }
                        case 2: {
                            expect(message.startsWith('unsubscribe')).toBeTruthy();
                            break;
                        }
                        default:
                            break;
                    }

                    n++;
                });
            });
            mockWebSocket.onopen = function() {
                subscriber
                    .getSnapshot('component', 'stateMachine', privateTopics)
                    .then(items => mockServer.stop(done))
                    .catch(err => {
                        console.error(err);
                    });
            };
        });
    });
});
