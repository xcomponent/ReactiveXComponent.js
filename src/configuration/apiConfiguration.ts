import {
    ParsedApiConfiguration,
    ApiCommunication,
    Component,
    State,
    StateMachine
} from "./parsedApiConfiguration";

export interface PublisherDetails {
    eventCode: number;
    routingKey: string;
}

export enum SubscriberEventType {
    Update,
    Error
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

export class DefaultApiConfiguration implements ApiConfiguration {

    private _config: ParsedApiConfiguration;

    constructor(rawConfig: ParsedApiConfiguration) {
        this._config = rawConfig;
        if (!this.validate()) {
            throw new Error("invalid configuration");
        }
    }

    private validate(): boolean {
        return this._config !== undefined
            && this._config.deployment !== undefined
            && this._config.deployment.codesConverter !== undefined
            && this._config.deployment.clientAPICommunication !== undefined;
    }

    getComponentCode(componentName: string): number {
        const component = this.findComponentByName(componentName);
        return Number(component.attributes.id);
    }

    containsComponent(componentName: string): boolean {
        const component = this.findComponent(component => component.attributes.name === componentName);

        return component ? true : false;
    }

    getStateMachineCode(componentName: string, stateMachineName: string): number {
        const component = this.findComponentByName(componentName);
        const stateMachine = this.findStateMachine(component, stm => stm.attributes.name === stateMachineName);
        if (!stateMachine) {
            throw new Error(`StateMachine '${stateMachineName}' not found`);
        }
        return Number(stateMachine.attributes.id);
    }

    containsStateMachine(componentName: string, stateMachineName: string): boolean {
        const component = this.findComponent(component => component.attributes.name === componentName);

        if (!component) return false;

        const stateMachine = this.findStateMachine(component, stm => stm.attributes.name === stateMachineName);
        return stateMachine ? true : false;
    }

    private findComponentByName(componentName: string): Component {
        const component = this.findComponent(component => component.attributes.name === componentName);
        if (!component) {
            throw new Error(`Component '${componentName}' not found`);
        }
        return component;
    }

    private findComponent(predicate: (component: Component) => boolean): Component {
        return this._config.deployment.codesConverter[0].components[0].component.find(predicate);
    }

    private findStateMachine(component, predicate: (stateMachine: StateMachine) => boolean): StateMachine {
        return component.stateMachines[0].stateMachine.find(predicate);
    }

    getPublisherDetails(componentCode: number, stateMachineCode: number, messageType: string): PublisherDetails {
        const publisher = this.getPublisher(componentCode, stateMachineCode, messageType);

        if (!publisher) {
            throw new Error(`publisher not found - component code: ${componentCode} - statemachine code: ${stateMachineCode} - message type: ${messageType} `);
        }

        return {
            eventCode: Number(publisher.attributes.eventCode),
            routingKey: publisher.topic[0].value
        };
    }

    private getPublisher(componentCode: number, stateMachineCode: number, messageType: string): ApiCommunication {
        return this._config.deployment.clientAPICommunication[0].publish
            .find(pub => Number(pub.attributes.componentCode) === componentCode
                && Number(pub.attributes.stateMachineCode) === stateMachineCode
                && pub.attributes.event === messageType);
    }

    containsPublisher(componentCode: number, stateMachineCode: number, messageType: string): boolean {
        return this.getPublisher(componentCode, stateMachineCode, messageType) !== undefined;
    }

    getSubscriberTopic(componentCode: number, stateMachineCode: number, type: SubscriberEventType): string {
        const subscriber = this.getSubscriber(componentCode, stateMachineCode, type);

        if (!subscriber) {
            throw new Error(`Subscriber not found - component code: ${componentCode} - statemachine code: ${stateMachineCode}`);
        }

        return subscriber.topic[0].value;
    }

    containsSubscriber(componentCode: number, stateMachineCode: number, type: SubscriberEventType): boolean {
        return this.getSubscriber(componentCode, stateMachineCode, type) !== undefined;
    }

    private getSubscriber(componentCode: number, stateMachineCode: number, type: SubscriberEventType): ApiCommunication {
        return this._config.deployment.clientAPICommunication[0].subscribe
            .find(pub => Number(pub.attributes.componentCode) === componentCode
                && Number(pub.attributes.stateMachineCode) === stateMachineCode
                && pub.attributes.eventType === SubscriberEventType[type].toUpperCase());
    }

    getSnapshotTopic(componentCode: number): string {
        const snapshot = this._config.deployment.clientAPICommunication[0].snapshot
            .find(pub => Number(pub.attributes.componentCode) === componentCode);

        if (!snapshot) {
            throw new Error(`Snapshot topic not found - component code: ${componentCode}`);
        }

        return snapshot.topic[0].value;
    }

    getStateName(componentCode: number, stateMachineCode: number, stateCode: number): string {
        const component = this.findComponent(component => Number(component.attributes.id) === componentCode);
        if (!component) {
            throw new Error(`Component '${componentCode}' not found`);
        }

        const stateMachine = this.findStateMachine(component, stm => Number(stm.attributes.id) === stateMachineCode);
        if (!stateMachine) {
            throw new Error(`StateMachine '${stateMachineCode}' not found`);
        }

        const state = stateMachine.states[0].State
            .find((state) => Number(state.attributes.id) === stateCode);

        if (!state) {
            throw new Error(`State '${stateCode}' not found`);
        }

        return state.attributes.name;
    }
}