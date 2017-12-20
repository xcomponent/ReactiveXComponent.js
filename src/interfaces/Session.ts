import { StateMachineInstance } from "./StateMachineInstance";
import { Observable } from "rxjs/Observable";
import { StateMachineUpdateListener } from "./StateMachineUpdateListener";
import { PrivateTopics } from "./PrivateTopics";

export interface Session {
    send(componentName: string, stateMachineName: string, messageType: string, jsonMessage: any): void;
    send(componentName: string, stateMachineName: string, messageType: string, jsonMessage: any, visibilityPrivate: boolean): void;
    send(componentName: string, stateMachineName: string, messageType: string, jsonMessage: any, visibilityPrivate: boolean, specifiedPrivateTopic: string): void;
    canPublish(componentName: string, stateMachineName: string, messageType: string): boolean;
    getSnapshot(componentName: string, stateMachineName: string): Promise<Array<StateMachineInstance>>;
    getStateMachineUpdates(componentName: string, stateMachineName: string): Observable<StateMachineInstance>;
    subscribe(componentName: string, stateMachineName: string, stateMachineUpdateListener: StateMachineUpdateListener): void;
    unsubscribe(componentName: string, stateMachineName: string): void;
    canSubscribe(componentName: string, stateMachineName: string): boolean;
    privateTopics: PrivateTopics;
    dispose(): void;
}