let tags: any = {};

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


let Configuration = function (parser) {
    this.parser = parser;
};


Configuration.prototype.init = function (xml) {
    this.parser.parse(xml, tags);
};


Configuration.prototype.getCodes = function (componentName, stateMachineName) {
    return this.parser.getCodes(componentName, stateMachineName);
};


Configuration.prototype.publisherExist = function (componentCode, stateMachineCode, messageType) {
    return this.parser.publisherExist(componentCode, stateMachineCode, messageType);
};


Configuration.prototype.codesExist = function (componentName, stateMachineName) {
    return this.parser.codesExist(componentName, stateMachineName);
};


Configuration.prototype.getPublisherDetails = function (componentCode, stateMachineCode, messageType) {
    return this.parser.getPublisherDetails(componentCode, stateMachineCode, messageType);
};


Configuration.prototype.getSubscriberTopic = function (componentName, stateMachineName) {
    return this.parser.getSubscriberTopic(componentName, stateMachineName);
};


Configuration.prototype.subscriberExist = function (componentName, stateMachineName) {
    return this.parser.subscriberExist(componentName, stateMachineName);
};


Configuration.prototype.getSnapshotTopic = function (componentName) {
    return this.parser.getSnapshotTopic(componentName);
};


Configuration.prototype.getStateName = function (componentCode, stateMachineCode, stateCode) {
    return this.parser.getStateName(componentCode, stateMachineCode, stateCode);
};

export default Configuration;
