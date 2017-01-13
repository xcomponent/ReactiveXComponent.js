export interface RawApiConfiguration {
    deployment: DeploymentDefinition;
}

export interface DeploymentDefinition {
    codesConverter: [CodeConverter];
    clientAPICommunication: [ClientApiCommunicationDefinition];
}

export interface CodeConverter {
    components: [{ component: [ComponentDefinition] }];
}

export interface ComponentDefinition {
    $: { name: string, id: string };
    stateMachines: [{ stateMachine: [StateMachineDefinition] }];
}

export interface StateMachineDefinition {
    $: { name: string, id: string };
    states: [{ State: [StateDefinition] }];
}

export interface StateDefinition {
    $: { name: string, id: string };
}

export interface ClientApiCommunicationDefinition {
    publish: [ApiCommunicationDefinition];
    subscribe: [ApiCommunicationDefinition];
    snapshot: [ApiCommunicationDefinition];
}

export interface ApiCommunicationDefinition {
    $: { componentCode: string, stateMachineCode?: string, eventType?: string, event?: string, eventCode?: string };
    topic: [TopicDefinition];
}

export interface TopicDefinition {
    _: string;
}