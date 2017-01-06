export interface CodeDetails {
    componentCode: string;
    stateMachineCode: string;
}

export interface PublisherDetails {
    eventCode: string;
    routingKey: string;
}

export enum SubscriberEventType {
    Update,
    Error
}

export interface ApiConfiguration {
    getCodes(componentName: string, stateMachineName: string): CodeDetails;
    getPublisherDetails(componentCode: string, stateMachineCode: string, messageType: string): PublisherDetails;
    getSubscriberTopic(componentCode: string, stateMachineCode: string, type: SubscriberEventType): string;
    getSnapshotTopic(componentCode: string): string;
    getStateName(componentCode: string, stateMachineCode: string, stateCode: string): string;
    codesExist(componentName: string, stateMachineName: string): boolean;
    publisherExist(componentCode: string, stateMachineCode: string, messageType: string): boolean;
    subscriberExist(componentCode: string, stateMachineCode: string, type: SubscriberEventType): boolean;
}

export class DefaultApiConfiguration implements ApiConfiguration {

    private _config: any;

    constructor(configObject: any) {
        this._config = configObject;
    }

    getCodes(componentName: string, stateMachineName: string): CodeDetails {
        const component = this.getComponentDetails(componentName);
        const stateMachine = component.stateMachines[0].stateMachine
            .find(stm => stm.$.name === stateMachineName);

        if (stateMachine === undefined) {
            throw new Error(`StateMachine '${stateMachineName}' not found`);
        }

        return { componentCode: component.$.id, stateMachineCode: stateMachine.$.id };
    }

    private getComponentDetails(componentName: string) {
        const component = this._config.deployment.codesConverter[0].components[0].component
            .find(component => component.$.name === componentName);

        if (component === undefined) {
            throw new Error(`Component '${componentName}' not found`);
        }

        return component;
    }

    getPublisherDetails(componentCode: string, stateMachineCode: string, messageType: string): PublisherDetails {
        const publisher = this._config.deployment.clientAPICommunication[0].publish
            .find(pub => pub.$.componentCode === componentCode
                && pub.$.stateMachineCode === stateMachineCode
                && pub.$.event === messageType);

        if (publisher === undefined) {
            throw new Error(`publisher not found - component code: ${componentCode} - statemachine code: ${stateMachineCode} - message type: ${messageType} `);
        }

        return {
            eventCode: publisher.$.eventCode,
            routingKey: publisher.topic[0]._
        };
    }

    getSubscriberTopic(componentCode: string, stateMachineCode: string, type: SubscriberEventType): string {
        const subscriber = this._config.deployment.clientAPICommunication[0].subscribe
            .find(pub => pub.$.componentCode === componentCode
                && pub.$.stateMachineCode === stateMachineCode
                && pub.$.eventType === SubscriberEventType[type].toUpperCase());

        if (subscriber === undefined) {
            throw new Error(`Subscriber not found - component code: ${componentCode} - statemachine code: ${stateMachineCode}`);
        }

        return subscriber.topic[0]._;
    }

    getSnapshotTopic(componentCode: string): string {
        const snapshot = this._config.deployment.clientAPICommunication[0].snapshot
            .find(pub => pub.$.componentCode === componentCode);

        if (snapshot === undefined) {
            throw new Error(`Snapshot topic not found - component code: ${componentCode}`);
        }

        return snapshot.topic[0]._;
    }

    getStateName(componentCode: string, stateMachineCode: string, stateCode: string): string {
        const component = this._config.deployment.codesConverter[0].components[0].component
            .find(component => component.$.id === componentCode);

        if (component === undefined) {
            throw new Error(`Component '${componentCode}' not found`);
        }

        const stateMachine = component.stateMachines[0].stateMachine
            .find(stm => stm.$.id === stateMachineCode);

        if (stateMachine === undefined) {
            throw new Error(`StateMachine '${stateMachineCode}' not found`);
        }

        const state = stateMachine.states[0].State
            .find(state => state.$.id === stateCode);

        if (state === undefined) {
            throw new Error(`State '${stateCode}' not found`);
        }

        return state.$.name;
    }

    codesExist(componentName: string, stateMachineName: string): boolean {
        try {
            this.getCodes(componentName, stateMachineName);
            return true;
        }
        catch (_) {
            return false;
        }
    }

    publisherExist(componentCode: string, stateMachineCode: string, messageType: string): boolean {
        try {
            this.getPublisherDetails(componentCode, stateMachineCode, messageType);
            return true;
        }
        catch (_) {
            return false;
        }
    }

    subscriberExist(componentCode: string, stateMachineCode: string, type: SubscriberEventType): boolean {
        try {
            this.getSubscriberTopic(componentCode, stateMachineCode, type);
            return true;
        }
        catch (_) {
            return false;
        }
    }
}