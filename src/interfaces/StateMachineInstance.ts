import { StateMachineRef } from "./StateMachineRef";

export interface StateMachineInstance {
    stateMachineRef: StateMachineRef;
    jsonMessage: any;
}