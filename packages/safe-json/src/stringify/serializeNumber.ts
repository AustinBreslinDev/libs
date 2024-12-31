import type { SimpleSerialier } from "./ts-types.js";

/**
 * Serializes a number value for JSON.
 * @param value - The number value to serialize.
 * @returns The serialized number or "null" for NaN and Infinity.
 */
export const serializeNumber: SimpleSerialier<string, number> = (value) =>
    Number.isFinite(value) ? value.toString() : "null";
