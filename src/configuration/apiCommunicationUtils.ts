import { ApiCommunication, Topic } from './parsedApiConfigurationTypes';

// Définir un type plus large pour couvrir les cas transformés depuis le XML
export type RawCommunication = {
  attributes?: Partial<ApiCommunication['attributes']>;
  componentCode?: string;
  stateMachineCode?: string;
  eventType?: string;
  event?: string;
  eventCode?: string;
  topic?: { value?: string; type?: string; _?: string } | { value?: string; type?: string; _?: string }[];
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

function normalizeTopic(
  topic: { value?: string; type?: string; _?: string } | { value?: string; type?: string; _?: string }[] | undefined
): [Topic] {
  if (!topic) {
    return [{ value: '' }];
  }

  if (Array.isArray(topic)) {
    const normalized = topic.map((t): Topic => ({
      value: typeof t._ === 'string' ? t._ :
             typeof t.value === 'string' ? t.value :
             typeof t.type === 'string' ? t.type :
             ''
    }));
    
    return normalized.length > 0 ? [normalized[0]] : [{ value: '' }];
  }

  return [{
    value: typeof topic._ === 'string' ? topic._ :
           typeof topic.value === 'string' ? topic.value :
           typeof topic.type === 'string' ? topic.type :
           ''
  }];
}
