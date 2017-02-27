import { ParsedApiConfiguration } from "./parsedApiConfiguration";
export interface PublisherDetails {
    eventCode: number;
    routingKey: string;
}
export declare enum SubscriberEventType {
    Update = 0,
    Error = 1,
}
export interface ApiConfiguration {
    getComponentCode(componentName: string): number;
    containsComponent(componentName: string): boolean;
    getStateMachineCode(componentName: string, stateMachineName: string): number;
    containsStateMachine(componentName: string, stateMachineName: string): boolean;
    getPublisherDetails(componentCode: number, stateMachineCode: number, messageType: string): PublisherDetails;
    getSubscriberTopic(componentCode: number, stateMachineCode: number, type: SubscriberEventType): string;
    getSnapshotTopic(componentCode: number): string;
    getStateName(componentCode: number, stateMachineCode: number, stateCode: number): string;
    containsPublisher(componentCode: number, stateMachineCode: number, messageType: string): boolean;
    containsSubscriber(componentCode: number, stateMachineCode: number, type: SubscriberEventType): boolean;
}
export declare class DefaultApiConfiguration implements ApiConfiguration {
    private _config;
    constructor(rawConfig: ParsedApiConfiguration);
    private validate();
    getComponentCode(componentName: string): number;
    containsComponent(componentName: string): boolean;
    getStateMachineCode(componentName: string, stateMachineName: string): number;
    containsStateMachine(componentName: string, stateMachineName: string): boolean;
    private findComponentByName(componentName);
    private findComponent(predicate);
    private findStateMachine(component, predicate);
    getPublisherDetails(componentCode: number, stateMachineCode: number, messageType: string): PublisherDetails;
    private getPublisher(componentCode, stateMachineCode, messageType);
    containsPublisher(componentCode: number, stateMachineCode: number, messageType: string): boolean;
    getSubscriberTopic(componentCode: number, stateMachineCode: number, type: SubscriberEventType): string;
    containsSubscriber(componentCode: number, stateMachineCode: number, type: SubscriberEventType): boolean;
    private getSubscriber(componentCode, stateMachineCode, type);
    getSnapshotTopic(componentCode: number): string;
    getStateName(componentCode: number, stateMachineCode: number, stateCode: number): string;
}
