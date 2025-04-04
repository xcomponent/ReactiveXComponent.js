import { DefaultApiConfigurationParser } from '../../src/configuration/apiConfigurationParser';
import { SubscriberEventType } from '../../src/configuration/apiConfiguration';
import fs = require('fs');

const parse = (input?: string) => {
    const xml = input ? input : fs.readFileSync('src/utils/apiConfigExample.xml', 'utf8');
    const parser = new DefaultApiConfigurationParser();
    return parser.parse(xml);
};

test('Given a valid xml config, the parsing result should be a valid ApiConfiguration object', () => {
    return parse().then(config => expect(config).toBeDefined());
});

test('ApiConfiguration parsing: throws exception on non XML input', () => {
    return testParseWithWrongInput('wrong text input');
});

test('ApiConfiguration parsing: throws exception on wrong XML input', () => {
    return testParseWithWrongInput('<deployment />');
});

const testParseWithWrongInput = (input: string) => {
    return parse(input)
        .then(_ => fail())
        .catch(e => {
            /**/
        });
};

test('GetComponentCode should return the right code given an existing component name', () => {
    return parse().then(config => {
        let code = config.getComponentCode('HelloWorld');
        let correctCode = -69981087;
        expect(code).toEqual(correctCode);

        code = config.getComponentCode('HelloWorld');
        correctCode = -69981087;
        expect(code).toEqual(correctCode);
    });
});

test('GetStateMachineCode should return the right code given existing component name and statemachine name', () => {
    return parse().then(config => {
        let code = config.getStateMachineCode('HelloWorld', 'HelloWorldManager');
        let correctCode = -829536631;
        expect(code).toEqual(correctCode);

        code = config.getStateMachineCode('HelloWorld', 'HelloWorldResponse');
        correctCode = -343862282;
        expect(code).toEqual(correctCode);
    });
});

test('GetComponentCode throws exception when using an unkonwn component name', () => {
    const componentName = 'random component';
    const messageError = "Component '" + componentName + "' not found";
    return parse()
        .then(config => {
            config.getComponentCode(componentName);
            fail();
        })
        .catch(e => expect(e.message).toBe(messageError));
});

test('GetStateMachineCode throws exception when using an unkonwn component name', () => {
    const componentName = 'random component';
    const stateMachineName = 'random state machine';
    const messageError = "Component '" + componentName + "' not found";
    return parse()
        .then(config => {
            config.getStateMachineCode(componentName, stateMachineName);
            fail();
        })
        .catch(e => expect(e.message).toBe(messageError));
});

test('GetStateMachineCode: throws exception when using an unknown stateMachine name', () => {
    const stateMachine = 'random stateMachine';
    const messageError = "StateMachine '" + stateMachine + "' not found";
    return parse()
        .then(config => {
            config.getStateMachineCode('HelloWorld', stateMachine);
            fail();
        })
        .catch(e => expect(e.message).toBe(messageError));
});

test('GetPublisherDetails should return the right publisher details given existing component and stateMachine codes', () => {
    return parse().then(config => {
        let correctPublish = {
            eventCode: 9,
            routingKey: 'input.1_0.HelloWorldMicroservice.HelloWorld.HelloWorldManager',
        };
        let publish = config.getPublisherDetails(-69981087, -829536631, 'XComponent.HelloWorld.UserObject.SayHello');
        console.log('debug GetPublisherDetails: ' + publish);
        console.log('debug GetPublisherDetails: ' + JSON.stringify(publish));
        expect(publish).toEqual(correctPublish);
    });
});

test('GetPublisherDetails should throw exeption when using an unknown stateMachine name', () => {
    const componentCode = 101;
    const stateMachineCode = 102;
    const messageType = 'type';
    let messageError = `publisher not found - component code: ${componentCode} - statemachine code: ${stateMachineCode} - message type: ${messageType} `;

    return parse()
        .then(config => {
            config.getPublisherDetails(componentCode, stateMachineCode, messageType);
            fail();
        })
        .catch(e => expect(e.message).toBe(messageError));
});

test('getSubscriberTopic should return the right topic given existing component and stateMachine', () => {
    let correctTopic = 'output.1_0.HelloWorldMicroservice.HelloWorld.HelloWorldResponse';
    return parse().then(config => {
        let topic = config.getSubscriberTopic(-69981087, -343862282, SubscriberEventType.Update);
        expect(topic).toEqual(correctTopic);
    });
});

test('GetSubscriberTopic throws exception on wrong component or/and a stateMachine', () => {
    const componentCode = 101;
    const stateMachineCode = 102;
    const messageError = `Subscriber not found - component code: ${componentCode} - statemachine code: ${stateMachineCode}`;

    return parse()
        .then(config => {
            config.getSubscriberTopic(componentCode, stateMachineCode, SubscriberEventType.Update);
            fail();
        })
        .catch(e => expect(e.message).toBe(messageError));
});

test('GetSnapshotTopic should return the right snapshot topic given an existing component', () => {
    let correctTopic = 'snapshot.1_0.HelloWorldMicroservice.HelloWorld';
    return parse().then(config => {
        let topic = config.getSnapshotTopic(-69981087);
        expect(topic).toEqual(correctTopic);
    });
});

test('GetSnapshotTopic should throw exception when using an unknown component code', () => {
    const componentCode = 101;
    const messageError = `Snapshot topic not found - component code: ${componentCode}`;

    return parse()
        .then(config => {
            config.getSnapshotTopic(componentCode);
            fail();
        })
        .catch(e => expect(e.message).toBe(messageError));
});

test('GetStateName should return the right state name given existing componentCode StateMachineCode and stateCode', () => {
    return parse().then(config => {
        expect(config.getStateName(-69981087, -829536631, 0)).toEqual('EntryPoint');
        expect(config.getStateName(-69981087, -343862282, 0)).toEqual('Start');
        expect(config.getStateName(-69981087, -343862282, 1)).toEqual('Loop');
        expect(config.getStateName(-69981087, -343862282, 2)).toEqual('Done');
    });
});

test('GetStateName should throw exeption when using an unknown componentCode', () => {
    const componentCode = 101;
    const messageError = `Component '${componentCode}' not found`;

    return parse()
        .then(config => {
            config.getStateName(componentCode, -343862282, 2);
            fail();
        })
        .catch(e => expect(e.message).toBe(messageError));
});

test('GetStateName should throw exeption when using an unknown stateMachineCode', () => {
    const stateMachineCode = 101;
    const messageError = `StateMachine '${stateMachineCode}' not found`;

    return parse()
        .then(config => {
            config.getStateName(-69981087, stateMachineCode, 2);
            fail();
        })
        .catch(e => expect(e.message).toBe(messageError));
});

test('GetStateName should throw exeption when using an unknown stateCode', () => {
    const stateCode = -10;
    const messageError = `State '${stateCode}' not found`;

    return parse()
        .then(config => {
            config.getStateName(-69981087, -343862282, stateCode);
            fail();
        })
        .catch(e => expect(e.message).toBe(messageError));
});

test('Given a componentCode, stateMachineCode and a messageType, containsPublisher should return true if the publisher exists and false otherwise', () => {
    return parse().then(config => {
        expect(config.containsPublisher(-69981087, -829536631, 'XComponent.HelloWorld.UserObject.SayHello')).toBe(true);
        expect(config.containsPublisher(101, 102, 'XComponent.HelloWorld.UserObject.SayHello')).toBe(false);
    });
});

test('Given a componentName and a stateMachineName, containsSubscriber should return true if the susbscriber exists and false otherwise', () => {
    return parse().then(config => {
        expect(config.containsSubscriber(101, 102, SubscriberEventType.Update)).toBe(false);
        expect(config.containsSubscriber(-69981087, 102, SubscriberEventType.Update)).toBe(false);
        expect(config.containsSubscriber(-69981087, -343862282, SubscriberEventType.Update)).toBe(true);
    });
});

test('Given a component name, containsComponent should return true if the component exists and false otherwise', () => {
    return parse().then(config => {
        expect(config.containsComponent('HelloWorld')).toBe(true);
        expect(config.containsComponent('random')).toBe(false);
    });
});

test('Given a component name and a stateMachine name, containsStateMachine should return true if they exist and false otherwise', () => {
    return parse().then(config => {
        expect(config.containsStateMachine('HelloWorld', 'HelloWorldResponse')).toBe(true);
        expect(config.containsStateMachine('random', 'HelloWorldResponse')).toBe(false);
        expect(config.containsStateMachine('HelloWorld', 'random')).toBe(false);
    });
});
