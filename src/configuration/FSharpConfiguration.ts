export interface FSharpFormat<T> {
    Case: string;
    Fields: Array<T>;
}

export let getFSharpFormat = function <T>(value: T): FSharpFormat<T> {
    if (value === undefined || value === null)
        return undefined;
    else
        return { "Case": "Some", "Fields": [value] };
};
