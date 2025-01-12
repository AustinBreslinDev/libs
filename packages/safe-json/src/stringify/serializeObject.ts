import { serialize } from "./serialize.js";
import { serializeString } from "./serializeString.js";
import type { GeneratorSerializer } from "./ts-types.js";

export const serializeObject: GeneratorSerializer<string, object> = function* (value, context, replacer) {
    // if ("toJSON" in value && typeof value.toJSON === "function") {
    //     value = value.toJSON();
    // }

    context.path.push(""); // Add a placeholder for object keys
    yield "{";
    const results: string[] = [];
    for (const [key, val] of Object.entries(value)) {
        const serializedKey = serializeString(key);
        if (context.visited.has(val)) {
            results.push(`${serializedKey}:"${context.visited.get(val)}"`);
            continue;
        }
        context.path[context.path.length - 1] = key;
        const serializedValue = replacer ? replacer(key, val) : val;
        if (serializedValue !== undefined) {
            const result = [...serialize(serializedValue, context, replacer)];
            if (result.length === 0) {
                continue;
            }
            results.push(`${serializedKey}:${result.join("")}`);
        }
    }
    yield results.join(",");
    yield "}";
    context.path.pop(); // Remove the object key placeholder
};
