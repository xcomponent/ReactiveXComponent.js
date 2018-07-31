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

    getStateMachineCode(componentName: string, stateMachineName: string): number {
        const component = this.findComponentByName(componentName);
        const stateMachine = this.findStateMachineByName(component, stateMachineName);
        return Number(stateMachine.attributes.id);
    }

    private findStateMachineByName(component: Component, stateMachineName: string): StateMachine {
        const stateMachine = this.findStateMachine(component, stm => stm.attributes.name === stateMachineName);
        if (!stateMachine) {
            throw new Error(`StateMachine '${stateMachineName}' not found`);
        }
        return stateMachine;
    }

    private findStateMachineByCode(component: Component, stateMachineCode: number): StateMachine {
        const stateMachine = this.findStateMachine(component, stm => Number(stm.attributes.id) === stateMachineCode);
        if (!stateMachine) {
            throw new Error(`StateMachine '${stateMachineCode}' not found`);
        }
        return stateMachine;
    }

    private findStateByCode(stateMachine: StateMachine, stateCode: number): State {
        const result = stateMachine.states[0].State
            .find((state) => Number(state.attributes.id) === stateCode);
        if (!result) {
            throw new Error(`State '${stateCode}' not found`);
        }
        return result;
    }

    private findComponentByName(componentName: string): Component {
        const result = this.findComponent(component => component.attributes.name === componentName);
        if (!result) {
            throw new Error(`Component '${componentName}' not found`);
        }
        return result;
    }

    private findComponentByCode(componentCode: number): Component {
        const result = this.findComponent(component => Number(component.attributes.id) === componentCode);
        if (!result) {
            throw new Error(`Component '${componentCode}' not found`);
        }
        return result;
    }

    private findComponent(predicate: (component: Component) => boolean): Component | undefined {
        return this._config.deployment.codesConverter[0].components[0].component.find(predicate);
    }

    private findStateMachine(component: Component, predicate: (stateMachine: StateMachine) => boolean): StateMachine | undefined {
        return component.stateMachines[0].stateMachine.find(predicate);
    }

    containsComponent(componentName: string): boolean {
        const result = this.findComponent(component => component.attributes.name === componentName);
        return result ? true : false;
    }

    containsStateMachine(componentName: string, stateMachineName: string): boolean {
        const result = this.findComponent(component => component.attributes.name === componentName);
        if (result) {
            return result.stateMachines[0].stateMachine.find(stm => stm.attributes.name === stateMachineName) != null;
        }
        return false;
    }

    containsPublisher(componentCode: number, stateMachineCode: number, messageType: string): boolean {
        return this.getPublisher(componentCode, stateMachineCode, messageType) !== undefined;
    }

    containsSubscriber(componentCode: number, stateMachineCode: number, type: SubscriberEventType): boolean {
        return this.getSubscriber(componentCode, stateMachineCode, type) !== undefined;
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

    private getPublisher(componentCode: number, stateMachineCode: number, messageType: string): ApiCommunication | undefined {
        return this._config.deployment.clientAPICommunication[0].publish
            .find(pub => Number(pub.attributes.componentCode) === componentCode
                && Number(pub.attributes.stateMachineCode) === stateMachineCode
                && pub.attributes.event === messageType);
    }

    getSubscriberTopic(componentCode: number, stateMachineCode: number, type: SubscriberEventType): string {
        const subscriber = this.getSubscriber(componentCode, stateMachineCode, type);

        if (!subscriber) {
            throw new Error(`Subscriber not found - component code: ${componentCode} - statemachine code: ${stateMachineCode}`);
        }

        return subscriber.topic[0].value;
    }

    private getSubscriber(componentCode: number, stateMachineCode: number, type: SubscriberEventType): ApiCommunication | undefined {
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
        const component = this.findComponentByCode(componentCode);
        const stateMachine = this.findStateMachineByCode(component, stateMachineCode);
        const state = this.findStateByCode(stateMachine, stateCode);

        return state.attributes.name;
    }
}