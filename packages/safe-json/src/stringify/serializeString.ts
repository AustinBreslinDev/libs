import { Constants } from "./constants.js";
import type { SimpleSerialier } from "./ts-types.js";

/**
 * Escapes and serializes a string value for JSON.
 * @param value - The string value to serialize.
 * @returns The serialized string with special characters escaped.
 */
export const serializeString: SimpleSerialier<string, string> = (value) =>
    `"${value.replaceAll(/[\\"\n\r\t]/g, (char) => {
        switch (char) {
            case Constants.backslash:
                return `${Constants.backslash}${Constants.backslash}`;
            case Constants.doubleQuote:
                return `${Constants.backslash}${Constants.doubleQuote}`;
            case Constants.newLine:
                return `${Constants.backslash}n`;
            case Constants.carrigeReturn:
                return `${Constants.backslash}r`;
            case Constants.tab:
                return `${Constants.backslash}t`;
            default:
                return char;
        }
    })}"`;
