import { serialize } from "./serialize.js";
import type { Replacer, SerializationContext, StringifyResult } from "./ts-types.js";

/**
 * Main stringify function for serializing values to JSON strings.
 * @param input - The value to serialize.
 * @param replacer - An optional replacer function.
 * @returns A tuple with an error (if any) and the serialized string.
 */
export function stringify(input: any, replacer?: Replacer): StringifyResult {
    const context: SerializationContext = {
        visited: new Map(),
        path: ["$ref"],
    };

    // Start serialization with the initial input
    try {
        const generator = serialize(input, context, replacer);
        return [undefined, [...generator].join("") as string];
    } catch (error) {
        return [error as Error, undefined];
    }
}
