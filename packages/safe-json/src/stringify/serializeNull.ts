import type { SimpleSerialier } from "./ts-types.js";

/**
 * Serializes a null value for JSON.
 * @returns The string "null".
 */
export const serializeNull: SimpleSerialier<string, null> = () => "null";
