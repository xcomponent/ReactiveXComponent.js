import { Publisher } from "../interfaces/Publisher";
import { StateMachineInstance, CompositionModel } from "../communication/xcomponentMessages";
import { Observable } from "rxjs/Observable";

export interface Subscriber {
    privateTopics: Array<String>;
    replyPublisher: Publisher;
    getHeartbeatTimer(heartbeatIntervalSeconds: number): NodeJS.Timer;
    getCompositionModel(xcApiName: string): Promise<CompositionModel>;
    getXcApiList(): Promise<Array<String>>;
    getXcApi(xcApiFileName: string): Promise<string>;
    getSnapshot(componentName: string, stateMachineName: string): Promise<Array<StateMachineInstance>>;
    getStateMachineUpdates(componentName: string, stateMachineName: string): Observable<StateMachineInstance>;
    canSubscribe(componentName: string, stateMachineName: string): boolean;
    subscribe(componentName: string, stateMachineName: string, stateMachineUpdateListener: (data: StateMachineInstance) => void): void;
    sendSubscribeRequestToTopic(topic: string, kind: number): void;
    sendUnsubscribeRequestToTopic(topic: string, kind: number): void;
    unsubscribe(componentName: string, stateMachineName: string): void;
    dispose(): void;
}