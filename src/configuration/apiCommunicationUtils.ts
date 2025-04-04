import { ApiCommunication, Topic } from './parsedApiConfigurationTypes';

type RawCommunication = Partial<ApiCommunication> & {
  attributes?: Partial<ApiCommunication['attributes']>;
  topic?: Topic | Topic[] | undefined;
  [key: string]: unknown;
};

export function normalizeCommunication(input: RawCommunication): ApiCommunication {
  return {
    attributes: {
      componentCode: input.componentCode ?? input.attributes?.componentCode ?? '',
      stateMachineCode: input.stateMachineCode ?? input.attributes?.stateMachineCode,
      eventType: input.eventType ?? input.attributes?.eventType,
      event: input.event ?? input.attributes?.event,
      eventCode: input.eventCode ?? input.attributes?.eventCode,
    },
    topic: normalizeTopic(input.topic),
  };
}

function normalizeTopic(topic: Topic | Topic[] | undefined): [Topic] {
  if (!topic) {
    return [{ value: '' }];
  }
  if (Array.isArray(topic)) {
    return topic.map((t) => ({ value: t.value ?? '' })) as [Topic];
  }
  return [{ value: topic.value ?? '' }];
}
