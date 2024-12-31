import { Constants } from "./constants.js";
import type { SimpleSerialier } from "./ts-types.js";

export const serializeDate: SimpleSerialier<string, Date> = (value) => {
    if (value.toString() === Constants.invalidDate) {
        // NOTE: DIFF: This is different to JSON.stringify
        return "null";
    }
    return `"${value.toISOString()}"`;
};
