import type { SimpleSerialier } from "./ts-types.js";

/**
 * Serializes a `bigint` value for JSON.
 * @param value - The `bigint` value to serialize.
 * @returns The serialized `bigint` as a string.
 */
export const serializeBigInt: SimpleSerialier<string, bigint> = (value) => value.toString();
