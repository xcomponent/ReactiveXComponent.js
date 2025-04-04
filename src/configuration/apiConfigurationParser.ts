import { DefaultApiConfiguration, ApiConfiguration } from './apiConfiguration';
import { ParsedApiConfiguration } from './parsedApiConfiguration';
import { parseXmlToJson } from '../utils/xmlParser';

export interface ApiConfigurationParser {
    parse(xmlConfig: string): Promise<ApiConfiguration>;
}

export class DefaultApiConfigurationParser implements ApiConfigurationParser {
    parse(xmlConfig: string): Promise<ApiConfiguration> {
        return new Promise((resolve, reject) => {
            try {
                const result = parseXmlToJson(xmlConfig);
                const rawConfig = result as ParsedApiConfiguration;
                resolve(new DefaultApiConfiguration(rawConfig));
            } catch (err) {
                reject(err);
            }
        });
    }
}
