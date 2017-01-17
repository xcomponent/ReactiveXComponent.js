export interface ParsedApiConfiguration {
    deployment: Deployment;
}

export interface Deployment {
    codesConverter: [CodeConverter];
    clientAPICommunication: [ClientApiCommunication];
}

export interface CodeConverter {
    components: [{ component: [Component] }];
}

export interface Component {
    attributes: { name: string, id: string };
    stateMachines: [{ stateMachine: [StateMachine] }];
}

export interface StateMachine {
    attributes: { name: string, id: string };
    states: [{ State: [State] }];
}

export interface State {
    attributes: { name: string, id: string };
}

export interface ClientApiCommunication {
    publish: [ApiCommunication];
    subscribe: [ApiCommunication];
    snapshot: [ApiCommunication];
}

export interface ApiCommunication {
    attributes: { componentCode: string, stateMachineCode?: string, eventType?: string, event?: string, eventCode?: string };
    topic: [Topic];
}

export interface Topic {
    value: string;
}