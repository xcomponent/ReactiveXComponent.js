import { parseString } from "xml2js";
import { DefaultApiConfiguration, ApiConfiguration } from "configuration/apiConfiguration";
import { ParsedApiConfiguration } from "configuration/parsedApiConfiguration";

export interface ApiConfigurationParser {
    parse(xmlConfig: string): Promise<ApiConfiguration>;
}

export class DefaultApiConfigurationParser implements ApiConfigurationParser {

    parse(xmlConfig: string): Promise<ApiConfiguration> {
        return new Promise((resolve, reject) => {
            parseString(xmlConfig, { charkey: "value", attrkey: "attributes" }, function (err, result) {
                if (err) {
                    reject(err);
                }
                else {
                    const rawConfig = result as ParsedApiConfiguration;
                    if (rawConfig) {
                        try {
                            resolve(new DefaultApiConfiguration(result));
                        }
                        catch (err) {
                            reject(err);
                        }
                    }
                    else {
                        reject(new Error(`invalid configuration: ${xmlConfig}`));
                    }
                }
            });
        });
    }
}