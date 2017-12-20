import { StateMachineInstance } from "./StateMachineInstance";

export interface StateMachineUpdateListener {
    onStateMachineUpdate(updatedInstance: StateMachineInstance);
}