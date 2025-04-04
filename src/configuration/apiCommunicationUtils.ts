import { ApiCommunication, Topic } from './parsedApiConfigurationTypes';

// Définir un type plus large pour couvrir les cas transformés depuis le XML
export type RawCommunication = {
  attributes?: Partial<ApiCommunication['attributes']>;
  topic?: { value?: string } | { value?: string }[];
};

export function normalizeCommunication(input: RawCommunication): ApiCommunication {
  const attr = input.attributes ?? {};

  return {
    attributes: {
      componentCode: attr.componentCode ?? '',
      stateMachineCode: attr.stateMachineCode,
      eventType: attr.eventType,
      event: attr.event,
      eventCode: attr.eventCode,
    },
    topic: normalizeTopic(input.topic),
  };
}

function normalizeTopic(topic: { value?: string } | { value?: string }[] | undefined): [Topic] {
  if (!topic) {
    return [{ value: '' }];
  }

  if (Array.isArray(topic)) {
    const normalized = topic.map((t): Topic => ({ value: t.value ?? '' }));
    return normalized.length > 0 ? [normalized[0]] : [{ value: '' }];
  }

  return [{ value: topic.value ?? '' }];
}