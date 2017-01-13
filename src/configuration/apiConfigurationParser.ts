import { parseString } from "xml2js";
import { DefaultApiConfiguration, ApiConfiguration } from "configuration/apiConfiguration";
import { RawApiConfiguration } from "configuration/rawApiConfiguration";

export interface ApiConfigurationParser {
    parse(xmlConfig: string): Promise<ApiConfiguration>;
}

export class DefaultApiConfigurationParser implements ApiConfigurationParser {

    parse(xmlConfig: string): Promise<ApiConfiguration> {
        return new Promise((resolve, reject) => {
            parseString(xmlConfig, function (err, result) {
                if (err) {
                    reject(err);
                }
                else {
                    const rawConfig = result as RawApiConfiguration;
                    if (rawConfig) {
                        resolve(new DefaultApiConfiguration(result));
                    }
                    else {
                        reject(new Error(`invalid configuration: ${xmlConfig}`));
                    }
                }
            });
        });
    }
}