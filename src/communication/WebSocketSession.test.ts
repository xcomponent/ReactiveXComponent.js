import { WebSocketSession } from '../../src/communication/WebSocketSession';

describe('Test xcSession module', function() {
    describe('Add private topic / SetPrivateTopic', function() {
        it('should not trigger server subscription on undefined topic', () => {
            // tslint:disable-next-line:no-any
            let mockWebSocket: any = {};
            // tslint:disable-next-line:no-any
            let apiConfiguration: any = {};
            mockWebSocket.send = jest.fn();
            mockWebSocket.getObservable = jest.fn();
            const session = new WebSocketSession(mockWebSocket, apiConfiguration);
            session.privateTopics.setDefaultPublisherTopic(undefined);
            session.privateTopics.addSubscriberTopic(undefined);
            expect(mockWebSocket.send).toHaveBeenCalledTimes(1);
        });

        it('Should add and set correctly the given private topics', () => {
            // tslint:disable-next-line:no-any
            let mockWebSocket: any = {};
            // tslint:disable-next-line:no-any
            let apiConfiguration: any = {};
            mockWebSocket.send = jest.fn();
            mockWebSocket.getObservable = jest.fn();
            const session = new WebSocketSession(mockWebSocket, apiConfiguration);
            const privateTopic = 'privateTopic';
            const anotherPrivateTopic = 'anotherPrivateTopic';
            session.privateTopics.setDefaultPublisherTopic(privateTopic);
            expect(session.privateTopics.getDefaultPublisherTopic()).toEqual(privateTopic);
            session.privateTopics.addSubscriberTopic(anotherPrivateTopic);
            expect(session.privateTopics.getSubscriberTopics()).toEqual([privateTopic, anotherPrivateTopic]);
        });
    });
});
