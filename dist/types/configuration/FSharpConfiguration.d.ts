export interface FSharpFormat<T> {
    Case: string;
    Fields: Array<T>;
}
export declare let getFSharpFormat: <T>(value: T) => FSharpFormat<T>;
