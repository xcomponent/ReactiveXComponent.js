export interface CodeDetails {
    componentCode: number;
    stateMachineCode: number;
}

export interface PublisherDetails {
    eventCode: number;
    routingKey: string;
}

export enum SubscriberEventType {
    Update,
    Error
}

export interface ApiConfiguration {
    getCodes(componentName: string, stateMachineName: string): CodeDetails;
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

    getCodes(componentName: string, stateMachineName: string): CodeDetails {
        const component = this.getComponentDetails(component => component.$.name === componentName, componentName);
        const stateMachine = this.getStateMachineDetails(component, stm => stm.$.name === stateMachineName, stateMachineName);

        return { componentCode: Number(component.$.id), stateMachineCode: Number(stateMachine.$.id) };
    }

    private getComponentDetails(filter: (component: any) => boolean, componentDescription?: string) {
        const component = this._config.deployment.codesConverter[0].components[0].component
            .find(filter);

        if (!component) {
            throw new Error(`Component '${componentDescription ? componentDescription : ""}' not found`);
        }

        return component;
    }

    private getStateMachineDetails(component, filter: (stateMachine: any) => boolean, stateMachineDescription?: string) {
        const stateMachine = component.stateMachines[0].stateMachine
            .find(filter);

        if (!stateMachine) {
            throw new Error(`StateMachine '${stateMachineDescription ? stateMachineDescription : ""}' not found`);
        }

        return stateMachine;
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
        if (this.getPublisher(componentCode, stateMachineCode, messageType)) {
            return true;
        }
        return false;
    }

    getSubscriberTopic(componentCode: number, stateMachineCode: number, type: SubscriberEventType): string {
        const subscriber = this.getSubscriber(componentCode, stateMachineCode, type);

        if (!subscriber) {
            throw new Error(`Subscriber not found - component code: ${componentCode} - statemachine code: ${stateMachineCode}`);
        }

        return subscriber.topic[0]._;
    }

    containsSubscriber(componentCode: number, stateMachineCode: number, type: SubscriberEventType): boolean {
        if (this.getSubscriber(componentCode, stateMachineCode, type)) {
            return true;
        }
        return false;
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
        const component = this.getComponentDetails(component => {
            return Number(component.$.id) === componentCode;
        }, componentCode.toString());
        const stateMachine = this.getStateMachineDetails(component, stm => Number(stm.$.id) === stateMachineCode, stateMachineCode.toString());

        const state = stateMachine.states[0].State
            .find(state => Number(state.$.id) === stateCode);

        if (!state) {
            throw new Error(`State '${stateCode}' not found`);
        }

        return state.$.name;
    }
}