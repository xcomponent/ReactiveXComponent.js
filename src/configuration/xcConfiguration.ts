let tags : any = {};

tags.component = "component";
tags.name = "name";
tags.id = "id";
tags.stateMachine = "stateMachine";
tags.state = "State";
tags.publish = "publish";
tags.componentCode = "componentCode";
tags.stateMachineCode = "stateMachineCode";
tags.eventCode = "eventCode";
tags.event = "event";
tags.topic = "topic";
tags.eventCode = "eventCode";
tags.subscribe = "subscribe";
tags.snapshot = "snapshot";

class Configuration {

    private parser : any;

    constructor(parser) {
        this.parser = parser;
    }

    init(xml) {
        this
            .parser
            .parse(xml, tags);
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
