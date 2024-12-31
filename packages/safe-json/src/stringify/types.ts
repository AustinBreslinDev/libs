/** The types of serialization to perform */
export const Types = {
    null: "null",
    array: "array",
    date: "date",
    buffer: "buffer",
    map: "map",
    set: "set",
    bigint: "bigint",
    object: "object",
    toJson: "toJson",
    function: "function",
    string: "string",
    nan: "nan",
    undefined: "undefined",
    number: "number",
    boolean: "boolean",
} as const;
