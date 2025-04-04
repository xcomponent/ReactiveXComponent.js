
import { ParsedApiConfiguration } from './parsedApiConfigurationTypes';
import { DefaultApiConfiguration, ApiConfiguration } from './apiConfiguration';
import { parseXmlToJson } from '../utils/xmlParser';

export interface ApiConfigurationParser {
  parse(xmlConfig: string): Promise<ApiConfiguration>;
}

// Remplace la dépendance à xml2js
export class DefaultApiConfigurationParser implements ApiConfigurationParser {
  parse(xmlConfig: string): Promise<ApiConfiguration> {
    return new Promise((resolve, reject) => {
      try {
        const result = parseXmlToJson(xmlConfig); // voir fonction ci-dessous
        const rawConfig = result as ParsedApiConfiguration;

        if (rawConfig?.deployment) {
          resolve(new DefaultApiConfiguration(rawConfig));
        } else {
          reject(new Error('Invalid parsed XML structure'));
        }
      } catch (err) {
        reject(err);
      }
    });
  }
}
