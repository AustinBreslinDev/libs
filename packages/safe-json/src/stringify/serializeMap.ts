import { serializeArray } from "./serializeArray.js";
import type { GeneratorSerializer } from "./ts-types.js";

export const serializeMap: GeneratorSerializer<string, Map<any, any>> = function* (value, context, replacer) {
    yield* serializeArray(Array.from(value.entries()), context, replacer);
};
