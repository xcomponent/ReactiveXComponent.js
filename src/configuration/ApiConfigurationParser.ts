import { parseString } from "xml2js";
import { DefaultApiConfiguration, ApiConfiguration } from "configuration/ApiConfiguration";

export interface ApiConfigurationParser {
    parse(xmlConfig: string): Promise<ApiConfiguration>;
}

export class DefaultApiConfigurationParser implements ApiConfigurationParser {

    parse(xmlConfig: string): Promise<ApiConfiguration> {
        return new Promise((resolve, reject) => {
            parseString(xmlConfig, function (err, result) {
                if (err) reject(err);
                else resolve(new DefaultApiConfiguration(result));
            });
        });
    }
}