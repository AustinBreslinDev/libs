import { serialize } from "./serialize.js";
import type { GeneratorSerializer } from "./ts-types.js";

/**
 * Serializes an array value for JSON using a generator.
 * @param value - The array to serialize.
 * @param context - The serialization context.
 * @param replacer - An optional replacer function.
 * @returns A generator yielding the serialized array.
 */
export const serializeArray: GeneratorSerializer<string, any[]> = function*(value, context, replacer) {
    context.path.push(""); // Add a placeholder for array indices
    yield "["; // Start the array serialization

    // Process each array element
    const serializedElements: string[] = [];
    for (let i = 0; i < value.length; i++) {
        context.path[context.path.length - 1] = String(i); // Update the path for the current index

        // Apply the replacer if provided, otherwise use the raw value
        const element = replacer ? replacer(String(i), value[i]) : value[i];

        if (element !== undefined) {
            // Serialize the element and collect its output
            serializedElements.push([...serialize(element, context, replacer)].join(""));
        }
    }

    // Yield the joined serialized elements, separated by commas
    yield serializedElements.join(",");
    yield "]"; // End the array serialization

    context.path.pop(); // Remove the array index placeholder from the path
};
