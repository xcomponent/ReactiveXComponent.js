// Interfaces principales pour le parsing de la configuration XML XComponent

export interface ParsedApiConfiguration {
    deployment: Deployment;
}

export interface ApiCommunication {
    attributes: {
        componentCode: string;
        stateMachineCode?: string;
        eventType?: string;
        event?: string;
        eventCode?: string;
    };
    topic: [Topic];
}

export interface Topic {
    value: string;
}

export interface Deployment {
    environment: string;
    xcProjectName: string;
    deploymentTargetCode: string;
    deploymentTargetName: string;
    version: string;
    frameworkType: string;
    xmlns: string;
    threading: object;
    serialization: string;
    communication: {
        websocket: WebSocketConfig;
    };
    clientAPICommunication: ClientAPICommunication;
    codesConverter: CodesConverter;
}

export interface PublisherDetails {
    eventCode: number;
    routingKey: string;
}

export enum SubscriberEventType {
    Update,
    Error,
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

export interface WebSocketConfig {
    name: string;
    host: string;
    port: string;
    user: string;
    password: string;
    type: string;
}

export interface ClientAPICommunication {
    publish: PublishSubscribeConfig;
    subscribe: PublishSubscribeConfig[];
    snapshot: SnapshotConfig;
}

export interface PublishSubscribeConfig {
    componentCode: string;
    stateMachineCode?: string;
    eventType: string;
    topicType: string;
    communicationType: string;
    stateCode?: string;
    eventCode?: string;
    event?: string;
    communication: string;
    communicationThreadingType?: string;
    topic: {
        type: string;
    };
}

export interface SnapshotConfig {
    componentCode: string;
    topic: {
        type: string;
    };
}

export interface CodesConverter {
    components: {
        component: Component[];
    };
}

export interface Component {
    name: string;
    id: string;
    events: {
        event: Event[];
    };
    stateMachines: {
        stateMachine: StateMachine[];
    };
}

export interface Event {
    name: string;
    id: string;
}

export interface StateMachine {
    name: string;
    id: string;
    states: {
        State: State | State[];
    };
}

export interface State {
    name: string;
    id: string;
}

// Utilitaire pour normaliser les states (si unique ou liste)
export function getStateArray(sm: StateMachine): State[] {
    const s = sm.states.State;
    return Array.isArray(s) ? s : [s];
}
