import { getType } from "./getType.js";
import { serializeArray } from "./serializeArray.js";
import { serializeBigInt } from "./serializeBigInt.js";
import { serializeBoolean } from "./serializeBoolean.js";
import { serializeBuffer } from "./serializeBuffer.js";
import { serializeDate } from "./serializeDate.js";
import { serializeMap } from "./serializeMap.js";
import { serializeNull } from "./serializeNull.js";
import { serializeNumber } from "./serializeNumber.js";
import { serializeObject } from "./serializeObject.js";
import { serializeSet } from "./serializeSet.js";
import { serializeString } from "./serializeString.js";
import { serializeToJson } from "./serializeToJson.js";
import type { Replacer, SerializationContext } from "./ts-types.js";
import { Types } from "./types.js";

/**
 * Core generator for value serialization.
 * @param value - The value to serialize.
 * @param context - The serialization context.
 * @param replacer - An optional replacer function.
 * @returns A generator for serialized strings.
 */
export const serialize = function*(value: any, context: SerializationContext, replacer: Replacer | undefined) {
    // Handle circular references
    if ((typeof value).toString() === Types.object && value !== null) {
        const refPath = context.visited.get(value);
        if (refPath) {
            yield `"${refPath}"`; // Return the reference path
            return;
        }
        // Track the object with its current path
        if (context.path.length === 1) {
            context.path.push("root");
            // context.visited.set(value, "root");
        }
        context.visited.set(value, context.path.join("."));
    }

    // Determine the type and yield the appropriate serialization
    const type = getType(value);
    switch (type) {
        case Types.string:
            yield serializeString(value);
            break;
        case Types.number:
            yield serializeNumber(value);
            break;
        case Types.boolean:
            yield serializeBoolean(value);
            break;
        case Types.null:
            yield serializeNull(value);
            break;
        case Types.array:
            yield* serializeArray(value, context, replacer);
            break;
        case Types.object:
            yield* serializeObject(value, context, replacer);
            break;
        case Types.date:
            yield serializeDate(value);
            break;
        case Types.buffer:
            yield serializeBuffer(value, context, replacer);
            break;
        case Types.map:
            yield* serializeMap(value, context, replacer);
            break;
        case Types.set:
            yield* serializeSet(value, context, replacer);
            break;
        case Types.bigint:
            yield serializeBigInt(value);
            break;
        case Types.undefined:
            yield serializeNull(value);
            break;
        case Types.toJson:
            yield* serializeToJson(value, context, replacer);
            break;
        // case "function":
        default:
            break; // Skip undefined and functions
    }
};
