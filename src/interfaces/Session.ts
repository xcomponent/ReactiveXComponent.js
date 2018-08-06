import { JsonMessage } from './../communication/xcomponentMessages';
import { StateMachineInstance } from './StateMachineInstance';
import { Observable } from 'rxjs';
import { StateMachineUpdateListener } from './StateMachineUpdateListener';
import { PrivateTopics } from './PrivateTopics';

export interface Session {
    send(componentName: string, stateMachineName: string, messageType: string, jsonMessage: JsonMessage): void;
    send(
        componentName: string,
        stateMachineName: string,
        messageType: string,
        jsonMessage: JsonMessage,
        visibilityPrivate: boolean
    ): void;
    send(
        componentName: string,
        stateMachineName: string,
        messageType: string,
        jsonMessage: JsonMessage,
        visibilityPrivate: boolean,
        specifiedPrivateTopic: string
    ): void;
    canSend(componentName: string, stateMachineName: string, messageType: string): boolean;
    getSnapshot(componentName: string, stateMachineName: string): Promise<Array<StateMachineInstance>>;
    getStateMachineUpdates(componentName: string, stateMachineName: string): Observable<StateMachineInstance>;
    subscribe(
        componentName: string,
        stateMachineName: string,
        stateMachineUpdateListener: StateMachineUpdateListener
    ): void;
    unsubscribe(componentName: string, stateMachineName: string): void;
    canSubscribe(componentName: string, stateMachineName: string): boolean;
    privateTopics: PrivateTopics;
    dispose(): void;
}
