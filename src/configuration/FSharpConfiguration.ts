export interface FSharpFormat {
    Case : string;
    Fields : Array < any >
}

export let getFSharpFormat = function (value : any) : FSharpFormat {
    return {"Case": "Some", "Fields": [value]}
}
