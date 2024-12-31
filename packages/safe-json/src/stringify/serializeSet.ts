import { serializeArray } from "./serializeArray.js";
import type { GeneratorSerializer } from "./ts-types.js";

export const serializeSet: GeneratorSerializer<string, Set<any>> = function* (value, context, replacer) {
    yield* serializeArray(Array.from(value.values()), context, replacer);
};
