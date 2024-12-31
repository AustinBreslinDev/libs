import { serializeObject } from "./serializeObject.js";
import type { GeneratorSerializer } from "./ts-types.js";

export const serializeBuffer: GeneratorSerializer<object, Buffer> = function* (value, context, replacer) {
    yield serializeObject(value.toJSON(), context, replacer);
};
