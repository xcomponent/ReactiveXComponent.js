
class Configuration {

    private parser : any;
    private tags = {
        component: "component",
        name: "name",
        id: "id",
        stateMachine: "stateMachine",
        state: "State",
        publish: "publish",
        componentCode: "componentCode",
        stateMachineCode: "stateMachineCode",
        eventCode: "eventCode",
        event: "event",
        topic: "topic",
        subscribe: "subscribe",
        snapshot: "snapshot"
    };

    constructor(parser) {
        this.parser = parser;
    }

    init(xml) {
        this
            .parser
            .parse(xml, this.tags);
    };

    getCodes(componentName, stateMachineName) {
        return this
            .parser
            .getCodes(componentName, stateMachineName);
    };

    publisherExist(componentCode, stateMachineCode, messageType) {
        return this
            .parser
            .publisherExist(componentCode, stateMachineCode, messageType);
    };

    codesExist(componentName, stateMachineName) {
        return this
            .parser
            .codesExist(componentName, stateMachineName);
    };

    getPublisherDetails(componentCode, stateMachineCode, messageType) {
        return this
            .parser
            .getPublisherDetails(componentCode, stateMachineCode, messageType);
    };

    getSubscriberTopic(componentName, stateMachineName) {
        return this
            .parser
            .getSubscriberTopic(componentName, stateMachineName);
    };

    subscriberExist(componentName, stateMachineName) {
        return this
            .parser
            .subscriberExist(componentName, stateMachineName);
    };

    getSnapshotTopic(componentName) {
        return this
            .parser
            .getSnapshotTopic(componentName);
    };

    getStateName(componentCode, stateMachineCode, stateCode) {
        return this
            .parser
            .getStateName(componentCode, stateMachineCode, stateCode);
    };

}

export default Configuration;
