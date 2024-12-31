import type { TypeTs } from "./ts-types.js";
import { Types } from "./types.js";

/**
 * Determines the type of a value for serialization.
 * @param value - The value to determine the type of.
 * @returns The type as a string.
 */
export const getType = (value: any): TypeTs => {
    const typeOf = (typeof value).toLowerCase();
    const primativeType = Types[typeOf as keyof typeof Types];

    if (Array.isArray(value)) {
        return Types.array;
    }
    if (value instanceof Date) {
        return Types.date;
    }
    if (Buffer.isBuffer(value)) {
        return Types.buffer;
    }
    if (value instanceof Map) {
        return Types.map;
    }
    if (value instanceof Set) {
        return Types.set;
    }
    if (value === null) {
        return Types.null;
    }

    if (typeOf === "object" && "toJSON" in value && typeof value.toJSON === "function") {
        return Types.toJson;
    }

    if (primativeType) {
        return primativeType;
    }
    return Types.object;
};
