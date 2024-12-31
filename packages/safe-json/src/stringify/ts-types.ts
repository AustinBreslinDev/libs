import type { Types } from "./types.js";

/** Used to track paths of objects in dot notation, to prevent circular references */
export type SerializationContext = {
    visited: Map<any, string>; // Tracks objects and their paths to detect circular references
    path: string[]; // Current property path
};

/** Replacer function similar as possible to JSON.stringify replacer function */
export type Replacer = (key: string, value: any) => any;

/** Serializer function that uses generators JS feature */
export type GeneratorSerializer<R, V> = (
    value: V,
    context: SerializationContext,
    replacer?: Replacer,
) => Generator<R, void, undefined>;

/** Serializer function that is generally simpler than the default generator version */
export type SimpleSerialier<R, V> = (value: V) => R;

/** The result type of stringify */
export type StringifyResult = [Error | undefined, string | undefined];

/** The types of serialization to perform */
export type TypeTs = keyof typeof Types;
