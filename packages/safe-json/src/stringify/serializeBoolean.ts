import type { SimpleSerialier } from "./ts-types.js";

/**
 * Serializes a boolean value for JSON.
 * @param value - The boolean value to serialize.
 * @returns "true" or "false".
 */
export const serializeBoolean: SimpleSerialier<string, boolean> = (value) => (value ? "true" : "false");
