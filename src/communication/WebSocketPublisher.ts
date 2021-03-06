import { ApiConfiguration } from '../configuration/apiConfiguration';
import { Header, Data, Serializer, JsonMessage } from './xcomponentMessages';
import { StateMachineRef } from '../interfaces/StateMachineRef';
import { PrivateTopics } from '../interfaces/PrivateTopics';
import { WebSocketWrapper } from './WebSocketWrapper';

export class WebSocketPublisher {
    private serializer: Serializer;

    constructor(
        private webSocketWrapper: WebSocketWrapper,
        private configuration: ApiConfiguration,
        private privateTopics: PrivateTopics,
        public sessionData?: string
    ) {
        this.serializer = new Serializer();
    }

    public send(
        componentName: string,
        stateMachineName: string,
        messageType: string,
        jsonMessage: JsonMessage,
        visibilityPrivate: boolean = false,
        specifiedPrivateTopic?: string
    ): void {
        let data = this.getDataToSend(
            componentName,
            stateMachineName,
            messageType,
            jsonMessage,
            visibilityPrivate,
            specifiedPrivateTopic
        );
        let webSocketInput = this.serializer.convertToWebsocketInputFormat(data);
        this.webSocketWrapper.send(webSocketInput);
    }

    public sendWithStateMachineRef(
        stateMachineRef: StateMachineRef,
        messageType: string,
        jsonMessage: JsonMessage,
        visibilityPrivate: boolean = false,
        specifiedPrivateTopic?: string
    ): void {
        let data = this.getDataToSendWithStateMachineRef(
            stateMachineRef,
            messageType,
            jsonMessage,
            visibilityPrivate,
            specifiedPrivateTopic
        );
        let webSocketInput = this.serializer.convertToWebsocketInputFormat(data);
        this.webSocketWrapper.send(webSocketInput);
    }

    public canSend(componentName: string, stateMachineName: string, messageType: string): boolean {
        if (this.configuration.containsStateMachine(componentName, stateMachineName)) {
            const componentCode = this.configuration.getComponentCode(componentName);
            const stateMachineCode = this.configuration.getStateMachineCode(componentName, stateMachineName);
            return this.configuration.containsPublisher(componentCode, stateMachineCode, messageType);
        }
        return false;
    }

    private getDataToSend(
        componentName: string,
        stateMachineName: string,
        messageType: string,
        jsonMessage: JsonMessage,
        visibilityPrivate: boolean = false,
        specifiedPrivateTopic?: string
    ): Data {
        const componentCode = this.configuration.getComponentCode(componentName);
        const stateMachineCode = this.configuration.getStateMachineCode(componentName, stateMachineName);
        let headerConfig = this.getHeaderConfig(
            componentCode,
            stateMachineCode,
            messageType,
            visibilityPrivate,
            specifiedPrivateTopic
        );
        const routingKey = this.getRoutingKey(componentCode, stateMachineCode, messageType);
        return {
            RoutingKey: routingKey,
            ComponentCode: componentCode,
            Event: {
                Header: headerConfig,
                JsonMessage: JSON.stringify(jsonMessage)
            }
        };
    }

    private getHeaderConfig(
        componentCode: number,
        stateMachineCode: number,
        messageType: string,
        visibilityPrivate: boolean,
        specifiedPrivateTopic?: string,
        stateMachineId?: string,
        workerId?: number
    ): Header {
        return {
            WorkerId: workerId,
            StateMachineId: stateMachineId,
            StateMachineCode: stateMachineCode,
            ComponentCode: componentCode,
            EventCode: this.configuration.getPublisherDetails(componentCode, stateMachineCode, messageType).eventCode,
            IncomingEventType: 0,
            MessageType: messageType,
            PublishTopic: !visibilityPrivate
                ? undefined
                : specifiedPrivateTopic
                    ? specifiedPrivateTopic
                    : this.privateTopics.getDefaultPublisherTopic(),
            SessionData: this.sessionData
        };
    }

    private getRoutingKey(componentCode: number, stateMachineCode: number, messageType: string): string {
        let publisher = this.configuration.getPublisherDetails(componentCode, stateMachineCode, messageType);
        return publisher.routingKey;
    }

    private getDataToSendWithStateMachineRef(
        stateMachineRef: StateMachineRef,
        messageType: string,
        jsonMessage: JsonMessage,
        visibilityPrivate: boolean = false,
        specifiedPrivateTopic?: string
    ): Data {
        let componentCode = stateMachineRef.ComponentCode;
        let stateMachineCode = stateMachineRef.StateMachineCode;
        let headerConfig = this.getHeaderConfig(
            componentCode,
            stateMachineCode,
            messageType,
            visibilityPrivate,
            specifiedPrivateTopic,
            stateMachineRef.StateMachineId,
            stateMachineRef.WorkerId
        );
        let routingKey = this.getRoutingKey(componentCode, stateMachineCode, messageType);
        return {
            RoutingKey: routingKey,
            ComponentCode: componentCode,
            Event: {
                Header: headerConfig,
                JsonMessage: JSON.stringify(jsonMessage)
            }
        };
    }
}
