import { serializeObject } from "./serializeObject.js";
import type { GeneratorSerializer } from "./ts-types.js";

export const serializeToJson: GeneratorSerializer<object, { toJSON: () => object }> = function* (
    value,
    context,
    replacer,
) {
    // had to put as any here because the TS defs are somewhat messed up, correct them later
    // TODO: Correct the TS definitions
    yield* serializeObject(value.toJSON(), context, replacer) as any;
};
