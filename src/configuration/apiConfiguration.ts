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

    private _config: any;

    constructor(configObject: any) {
        this._config = configObject;
        if (!this.validate()) {
            throw new Error("invalid configuration");
        }
    }

    private validate(): boolean {
        return this._config
            && this._config.deployment
            && this._config.deployment.codesConverter
            && this._config.deployment.clientAPICommunication;
    }

    getComponentCode(componentName: string): number {
        const component = this.getComponent(componentName);
        return Number(component.$.id);
    }

    containsComponent(componentName: string): boolean {
        const component = this.findComponent(component => component.$.name === componentName);

        return component ? true : false;
    }

    getStateMachineCode(componentName: string, stateMachineName: string): number {
        const component = this.getComponent(componentName);
        const stateMachine = this.findStateMachine(component, stm => stm.$.name === stateMachineName);
        if (!stateMachine) {
            throw new Error(`StateMachine '${stateMachineName}' not found`);
        }
        return Number(stateMachine.$.id);
    }

    containsStateMachine(componentName: string, stateMachineName: string): boolean {
        const component = this.findComponent(component => component.$.name === componentName);

        if (!component) return false;

        const stateMachine = this.findStateMachine(component, stm => stm.$.name === stateMachineName);
        return stateMachine ? true : false;
    }

    private getComponent(componentName: string): any {
        const component = this.findComponent(component => component.$.name === componentName);
        if (!component) {
            throw new Error(`Component '${componentName}' not found`);
        }
        return component;
    }

    private findComponent(predicate: (component: any) => boolean): any {
        return this._config.deployment.codesConverter[0].components[0].component.find(predicate);
    }

    private findStateMachine(component, predicate: (stateMachine: any) => boolean): any {
        return component.stateMachines[0].stateMachine.find(predicate);
    }

    getPublisherDetails(componentCode: number, stateMachineCode: number, messageType: string): PublisherDetails {
        const publisher = this.getPublisher(componentCode, stateMachineCode, messageType);

        if (!publisher) {
            throw new Error(`publisher not found - component code: ${componentCode} - statemachine code: ${stateMachineCode} - message type: ${messageType} `);
        }

        return {
            eventCode: Number(publisher.$.eventCode),
            routingKey: publisher.topic[0]._
        };
    }

    private getPublisher(componentCode: number, stateMachineCode: number, messageType: string) {
        return this._config.deployment.clientAPICommunication[0].publish
            .find(pub => Number(pub.$.componentCode) === componentCode
                && Number(pub.$.stateMachineCode) === stateMachineCode
                && pub.$.event === messageType);
    }

    containsPublisher(componentCode: number, stateMachineCode: number, messageType: string): boolean {
        return this.getPublisher(componentCode, stateMachineCode, messageType) !== undefined;
    }

    getSubscriberTopic(componentCode: number, stateMachineCode: number, type: SubscriberEventType): string {
        const subscriber = this.getSubscriber(componentCode, stateMachineCode, type);

        if (!subscriber) {
            throw new Error(`Subscriber not found - component code: ${componentCode} - statemachine code: ${stateMachineCode}`);
        }

        return subscriber.topic[0]._;
    }

    containsSubscriber(componentCode: number, stateMachineCode: number, type: SubscriberEventType): boolean {
        return this.getSubscriber(componentCode, stateMachineCode, type) !== undefined;
    }

    private getSubscriber(componentCode: number, stateMachineCode: number, type: SubscriberEventType) {
        return this._config.deployment.clientAPICommunication[0].subscribe
            .find(pub => Number(pub.$.componentCode) === componentCode
                && Number(pub.$.stateMachineCode) === stateMachineCode
                && pub.$.eventType === SubscriberEventType[type].toUpperCase());
    }

    getSnapshotTopic(componentCode: number): string {
        const snapshot = this._config.deployment.clientAPICommunication[0].snapshot
            .find(pub => Number(pub.$.componentCode) === componentCode);

        if (!snapshot) {
            throw new Error(`Snapshot topic not found - component code: ${componentCode}`);
        }

        return snapshot.topic[0]._;
    }

    getStateName(componentCode: number, stateMachineCode: number, stateCode: number): string {
        const component = this.findComponent(component => Number(component.$.id) === componentCode);
        if (!component) {
            throw new Error(`Component '${componentCode}' not found`);
        }

        const stateMachine = this.findStateMachine(component, stm => Number(stm.$.id) === stateMachineCode);
        if (!stateMachine) {
            throw new Error(`StateMachine '${stateMachineCode}' not found`);
        }

        const state = stateMachine.states[0].State
            .find(state => Number(state.$.id) === stateCode);

        if (!state) {
            throw new Error(`State '${stateCode}' not found`);
        }

        return state.$.name;
    }
}