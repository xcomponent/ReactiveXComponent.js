/// <reference types="es6-shim" />
import { ApiConfiguration } from "./apiConfiguration";
export interface ApiConfigurationParser {
    parse(xmlConfig: string): Promise<ApiConfiguration>;
}
export declare class DefaultApiConfigurationParser implements ApiConfigurationParser {
    parse(xmlConfig: string): Promise<ApiConfiguration>;
}
