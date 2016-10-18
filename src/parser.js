
define(["./javascriptHelper"], function (javascriptHelper) {
    "use strict";

    var Parser = function () {
    }


    Parser.prototype.parse = function (xml, tags) {
        var DOMParser = javascriptHelper.getJavascriptHelper().DOMParser;
        var xmlDom = (new DOMParser()).parseFromString(xml, 'text/xml');
        this.codes = getCodes(xmlDom, tags);
        this.publishersDetails = getPublihersDetails(xmlDom, tags);
        this.subscribersTopics = getSubscribersTopics(xmlDom, tags);
        this.snapshotTopics = getSnapshotTopics(xmlDom, tags);
        this.stateNames = getStateNames(xmlDom, tags);
    }


    var getStateNames = function (xmlDom, tags) {
        var stateNames = {};
        var components = xmlDom.getElementsByTagName(tags.component);
        for (var i = 0; i < components.length; i++) {
            var componentId = components[i].getAttribute(tags.id);
            var jsonStateMachines = getStateMachinesFromComponent(components[i], tags);
            stateNames[componentId] = jsonStateMachines;
        }
        return stateNames;
    }


    var getStateMachinesFromComponent = function (component, tags) {
        var stateMachines = component.getElementsByTagName(tags.stateMachine);
        var jsonStateMachines = {};
        for (var i = 0; i < stateMachines.length; i++) {
            var stateMachineId = stateMachines[i].getAttribute(tags.id);
            var jsonStates = getStatesFromStateMachine(stateMachines[i], tags);
            jsonStateMachines[stateMachineId] = jsonStates;
        }
        return jsonStateMachines;
    }


    var getStatesFromStateMachine = function (stateMachine, tags) {
        var states = stateMachine.getElementsByTagName(tags.state);
        var jsonStates = {};
        for (var i = 0; i < states.length; i++) {
            var stateName = states[i].getAttribute(tags.name);
            var stateId = states[i].getAttribute(tags.id);
            jsonStates[stateId] = stateName;
        }
        return jsonStates;
    }


    var getSnapshotTopics = function (xmlDom, tags) {
        var snapshots = xmlDom.getElementsByTagName(tags.snapshot);
        var snapshotTopics = {};
        var componentCode, topic;
        for (var i = 0; i < snapshots.length; i++) {
            componentCode = snapshots[i].getAttribute(tags.componentCode);
            topic = snapshots[i].getElementsByTagName(tags.topic)[0].textContent;
            snapshotTopics[componentCode] = topic;
        }
        return snapshotTopics;
    }


    var getSubscribersTopics = function (xmlDom, tags) {
        var subscribersTopics = {};
        var subscribers = xmlDom.getElementsByTagName(tags.subscribe);
        var componentCode, stateMachineCode, topic;
        for (var i = 0; i < subscribers.length; i++) {
            componentCode = subscribers[i].getAttribute(tags.componentCode);
            stateMachineCode = subscribers[i].getAttribute(tags.stateMachineCode);
            topic = subscribers[i].getElementsByTagName(tags.topic)[0].textContent;
            subscribersTopics[getKey([componentCode, stateMachineCode])] = topic;
        }
        return subscribersTopics;
    }


    var getCodes = function (xmlDom, tags) {
        var codes = {}, key, value;
        var componentName, stateMachineName, stateMachines;
        var components = xmlDom.getElementsByTagName(tags.component);
        for (var i = 0; i < components.length; i++) {
            componentName = components[i].getAttribute(tags.name);
            stateMachines = components[i].getElementsByTagName(tags.stateMachine);
            codes[componentName] = {
                "componentCode": components[i].getAttribute(tags.id),
                "stateMachineCodes": getStateMachineCodes(stateMachines, tags)
            };
        }
        return codes;
    }


    var getStateMachineCodes = function (stateMachines, tags) {
        var stateMachineCodes = {};
        var stateMachineName, stateMachineCode;
        for (var j = 0; j < stateMachines.length; j++) {
            stateMachineName = stateMachines[j].getAttribute(tags.name);
            stateMachineCode = stateMachines[j].getAttribute(tags.id);
            stateMachineCodes[stateMachineName] = stateMachineCode;
        }
        return stateMachineCodes;
    }


    var getPublihersDetails = function (xmlDom, tags) {
        var publishersDetails = {}, key, value;
        var componentCode, stateMachineCode, messageType;
        var publishs = xmlDom.getElementsByTagName(tags.publish);
        for (var i = 0; i < publishs.length; i++) {
            componentCode = publishs[i].getAttribute(tags.componentCode);
            stateMachineCode = publishs[i].getAttribute(tags.stateMachineCode);
            messageType = publishs[i].getAttribute(tags.event);
            key = getKey([componentCode, stateMachineCode, messageType]);
            value = {
                "eventCode": publishs[i].getAttribute(tags.eventCode),
                "routingKey": publishs[i].getElementsByTagName(tags.topic)[0].textContent
            };
            publishersDetails[key] = value;
        }
        return publishersDetails;
    }


    var getComponentCode = function (codes, componentName) {
        var componentCode;
        if (codes[componentName] == undefined) {
            throw new Error("Component '" + componentName + "' not found");
        } else {
            componentCode = codes[componentName].componentCode;
        }
        return componentCode;
    }


    var getStateMachineCode = function (codes, componentName, stateMachineName) {
        var stateMachineCode;
        var stateMachineCodes = codes[componentName].stateMachineCodes;
        if (stateMachineCodes[stateMachineName] == undefined) {
            throw new Error("StateMachine '" + stateMachineName + "' not found");
        } else {
            stateMachineCode = stateMachineCodes[stateMachineName];
        }
        return stateMachineCode;
    }


    Parser.prototype.codesExist = function (componentName, stateMachineName) {
        var componentCode = this.codes[componentName];
        if (componentCode == undefined) {
            return false;
        }
        var stateMachineCodes = this.codes[componentName].stateMachineCodes;
        if (stateMachineCodes[stateMachineName] == undefined) {
            return false;
        }
        return true;
    }


    Parser.prototype.getCodes = function (componentName, stateMachineName) {
        var componentCode = getComponentCode(this.codes, componentName);
        var stateMachineCode = getStateMachineCode(this.codes, componentName, stateMachineName);
        return {
            "componentCode": componentCode,
            "stateMachineCode": stateMachineCode
        }
    }


    Parser.prototype.publisherExist = function (componentCode, stateMachineCode, messageType) {
        return this.publishersDetails[getKey([componentCode, stateMachineCode, messageType])] != undefined;
    }


    Parser.prototype.getPublisherDetails = function (componentCode, stateMachineCode, messageType) {
        var publisherDetails = this.publishersDetails[getKey([componentCode, stateMachineCode, messageType])];
        if (publisherDetails == undefined) {
            throw new Error("PublisherDetails not found");
        } else {
            return publisherDetails;
        }
    }


    Parser.prototype.subscriberExist = function (componentName, stateMachineName) {
        if (this.codesExist(componentName, stateMachineName)) {
            var codes = this.getCodes(componentName, stateMachineName);
            var key = getKey([codes.componentCode, codes.stateMachineCode]);
            var topic = this.subscribersTopics[key];
            return topic != undefined;
        }
        return false;
    }


    Parser.prototype.getSubscriberTopic = function (componentName, stateMachineName) {
        if (!this.subscriberExist(componentName, stateMachineName)) {
            throw new Error("SubscriberTopic not found");
        }
        var codes = this.getCodes(componentName, stateMachineName);
        var key = getKey([codes.componentCode, codes.stateMachineCode]);
        var topic = this.subscribersTopics[key];
        return topic;
    }


    Parser.prototype.getSnapshotTopic = function (componentName) {
        var componentCode = getComponentCode(this.codes, componentName);
        return this.snapshotTopics[componentCode];
    }


    Parser.prototype.getStateName = function (componentCode, stateMachineCode, stateCode) {
        if (this.stateNames[componentCode] == undefined) {
            throw new Error("componentCode not found");
        }
        if (this.stateNames[componentCode][stateMachineCode] == undefined) {
            throw new Error("stateMachineCode not found");
        }
        if (this.stateNames[componentCode][stateMachineCode][stateCode] == undefined) {
            throw new Error("stateCode not found");
        }
        return this.stateNames[componentCode][stateMachineCode][stateCode];
    }


    var getKey = function (array) {
        var key = "";
        for (var i = 0; i < array.length; i++)
            key += array[i];
        return key;
    }


    return Parser;
});
