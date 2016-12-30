import { javascriptHelper } from "javascriptHelper";

class Parser {

    public codes: any;
    public publishersDetails: any;
    public subscribersTopics: any;
    public snapshotTopics: any;
    public stateNames: any;

    parse(xml, tags) {
        let DOMParser = javascriptHelper().DOMParser;
        let xmlDom = (new DOMParser()).parseFromString(xml, "text/xml");
        this.codes = this.parseCodes(xmlDom, tags);
        this.publishersDetails = this.getPublihersDetails(xmlDom, tags);
        this.subscribersTopics = this.getSubscribersTopics(xmlDom, tags);
        this.snapshotTopics = this.getSnapshotTopics(xmlDom, tags);
        this.stateNames = this.getStateNames(xmlDom, tags);
    }


    getStateNames(xmlDom, tags) {
        let stateNames = {};
        let components = xmlDom.getElementsByTagName(tags.component);
        for (let i = 0; i < components.length; i++) {
            let componentId = components[i].getAttribute(tags.id);
            let jsonStateMachines = this.getStateMachinesFromComponent(components[i], tags);
            stateNames[componentId] = jsonStateMachines;
        }
        return stateNames;
    }


    private getStateMachinesFromComponent(component, tags) {
        let stateMachines = component.getElementsByTagName(tags.stateMachine);
        let jsonStateMachines = {};
        for (let i = 0; i < stateMachines.length; i++) {
            let stateMachineId = stateMachines[i].getAttribute(tags.id);
            let jsonStates = this.getStatesFromStateMachine(stateMachines[i], tags);
            jsonStateMachines[stateMachineId] = jsonStates;
        }
        return jsonStateMachines;
    }

    private getStatesFromStateMachine(stateMachine, tags) {
        let states = stateMachine.getElementsByTagName(tags.state);
        let jsonStates = {};
        for (let i = 0; i < states.length; i++) {
            let stateName = states[i].getAttribute(tags.name);
            let stateId = states[i].getAttribute(tags.id);
            jsonStates[stateId] = stateName;
        }
        return jsonStates;
    }


    private getSnapshotTopics(xmlDom, tags) {
        let snapshots = xmlDom.getElementsByTagName(tags.snapshot);
        let snapshotTopics = {};
        let componentCode, topic;
        for (let i = 0; i < snapshots.length; i++) {
            componentCode = snapshots[i].getAttribute(tags.componentCode);
            topic = snapshots[i].getElementsByTagName(tags.topic)[0].textContent;
            snapshotTopics[componentCode] = topic;
        }
        return snapshotTopics;
    }


    private getSubscribersTopics(xmlDom, tags) {
        let subscribersTopics = {};
        let subscribers = xmlDom.getElementsByTagName(tags.subscribe);
        let componentCode, stateMachineCode, topic;
        for (let i = 0; i < subscribers.length; i++) {
            componentCode = subscribers[i].getAttribute(tags.componentCode);
            stateMachineCode = subscribers[i].getAttribute(tags.stateMachineCode);
            topic = subscribers[i].getElementsByTagName(tags.topic)[0].textContent;
            subscribersTopics[this.getKey([componentCode, stateMachineCode])] = topic;
        }
        return subscribersTopics;
    }


    private parseCodes(xmlDom, tags) {
        let codes = {}, key, value;
        let componentName, stateMachineName, stateMachines;
        let components = xmlDom.getElementsByTagName(tags.component);
        for (let i = 0; i < components.length; i++) {
            componentName = components[i].getAttribute(tags.name);
            stateMachines = components[i].getElementsByTagName(tags.stateMachine);
            codes[componentName] = {
                "componentCode": components[i].getAttribute(tags.id),
                "stateMachineCodes": this.getStateMachineCodes(stateMachines, tags)
            };
        }
        return codes;
    }


    private getStateMachineCodes(stateMachines, tags) {
        let stateMachineCodes = {};
        let stateMachineName, stateMachineCode;
        for (let j = 0; j < stateMachines.length; j++) {
            stateMachineName = stateMachines[j].getAttribute(tags.name);
            stateMachineCode = stateMachines[j].getAttribute(tags.id);
            stateMachineCodes[stateMachineName] = stateMachineCode;
        }
        return stateMachineCodes;
    }


    private getPublihersDetails(xmlDom, tags) {
        let publishersDetails = {}, key, value;
        let componentCode, stateMachineCode, messageType;
        let publishs = xmlDom.getElementsByTagName(tags.publish);
        for (let i = 0; i < publishs.length; i++) {
            componentCode = publishs[i].getAttribute(tags.componentCode);
            stateMachineCode = publishs[i].getAttribute(tags.stateMachineCode);
            messageType = publishs[i].getAttribute(tags.event);
            key = this.getKey([componentCode, stateMachineCode, messageType]);
            value = {
                "eventCode": publishs[i].getAttribute(tags.eventCode),
                "routingKey": publishs[i].getElementsByTagName(tags.topic)[0].textContent
            };
            publishersDetails[key] = value;
        }
        return publishersDetails;
    }


    private getComponentCode(codes, componentName) {
        let componentCode;
        if (codes[componentName] === undefined) {
            throw new Error("Component '" + componentName + "' not found");
        } else {
            componentCode = codes[componentName].componentCode;
        }
        return componentCode;
    }


    private getStateMachineCode(codes, componentName, stateMachineName) {
        let stateMachineCode;
        let stateMachineCodes = codes[componentName].stateMachineCodes;
        if (stateMachineCodes[stateMachineName] === undefined) {
            throw new Error("StateMachine '" + stateMachineName + "' not found");
        } else {
            stateMachineCode = stateMachineCodes[stateMachineName];
        }
        return stateMachineCode;
    }


    public codesExist(componentName, stateMachineName) {
        let componentCode = this.codes[componentName];
        if (componentCode === undefined) {
            return false;
        }
        let stateMachineCodes = this.codes[componentName].stateMachineCodes;
        if (stateMachineCodes[stateMachineName] === undefined) {
            return false;
        }
        return true;
    }


    public getCodes(componentName, stateMachineName) {
        let componentCode = this.getComponentCode(this.codes, componentName);
        let stateMachineCode = this.getStateMachineCode(this.codes, componentName, stateMachineName);
        return {
            "componentCode": componentCode,
            "stateMachineCode": stateMachineCode
        };
    }


    public publisherExist(componentCode, stateMachineCode, messageType) {
        return this.publishersDetails[this.getKey([componentCode, stateMachineCode, messageType])] !== undefined;
    }


    public getPublisherDetails(componentCode, stateMachineCode, messageType) {
        let publisherDetails = this.publishersDetails[this.getKey([componentCode, stateMachineCode, messageType])];
        if (publisherDetails === undefined) {
            throw new Error("PublisherDetails not found");
        } else {
            return publisherDetails;
        }
    }


    public subscriberExist(componentName, stateMachineName) {
        if (this.codesExist(componentName, stateMachineName)) {
            let codes = this.getCodes(componentName, stateMachineName);
            let key = this.getKey([codes.componentCode, codes.stateMachineCode]);
            let topic = this.subscribersTopics[key];
            return topic !== undefined;
        }
        return false;
    }


    public getSubscriberTopic(componentName, stateMachineName) {
        if (!this.subscriberExist(componentName, stateMachineName)) {
            throw new Error("SubscriberTopic not found");
        }
        let codes = this.getCodes(componentName, stateMachineName);
        let key = this.getKey([codes.componentCode, codes.stateMachineCode]);
        let topic = this.subscribersTopics[key];
        return topic;
    }


    public getSnapshotTopic(componentName) {
        let componentCode = this.getComponentCode(this.codes, componentName);
        return this.snapshotTopics[componentCode];
    }


    public getStateName(componentCode, stateMachineCode, stateCode) {
        if (this.stateNames[componentCode] === undefined) {
            throw new Error("componentCode not found");
        }
        if (this.stateNames[componentCode][stateMachineCode] === undefined) {
            throw new Error("stateMachineCode not found");
        }
        if (this.stateNames[componentCode][stateMachineCode][stateCode] === undefined) {
            throw new Error("stateCode not found");
        }
        return this.stateNames[componentCode][stateMachineCode][stateCode];
    }


    private getKey(array) {
        let key = "";
        for (let i = 0; i < array.length; i++)
            key += array[i];
        return key;
    }

};

export default Parser;
