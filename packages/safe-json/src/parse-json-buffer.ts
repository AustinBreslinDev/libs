const CONSTANTS = {
    openCurly: "{",
    closeCurly: "}",
    openSquare: "[",
    closeSquare: "]",
    doubleQuote: '"',
    singleQuote: "'",
    minus: "-",
    numberRegex: /[0-9]/,
    true: "true",
    false: "false",
    null: "null",
    colon: ":",
    comma: ",",
    space: " ",
    escapeSequences: {
        b: "b",
        f: "f",
        n: "n",
        r: "r",
        t: "t",
        backslash: "\\",
        forwardslash: "/",
        backspace: "\b",
        singleQuote: "'",
        doubleQuote: '"',
        newline: "\n",
        carriageReturn: "\r",
        tab: "\t",
        formFeed: "\f",
    },
    regexs: {
        space: /s/,
        number: /[0-9]/,
        scientificNotationNumber: /[0-9.eE+-]/,
    },
};

type JsonValue = string | number | boolean | null | JsonObject | JsonArray | undefined;
type JsonObject = {
    [key: string]: JsonValue;
};
type JsonArray = JsonValue[];

// Parse a number
function parseNumber(index: number, buffer: string): number {
    const start = index;
    while (CONSTANTS.regexs.scientificNotationNumber.test(buffer[index])) {
        index++;
    }
    const numberStr = buffer.slice(start, index);
    const number = Number(numberStr);
    if (Number.isNaN(number)) {
        throw new SyntaxError(`Invalid number at index ${start}: '${numberStr}'`);
    }
    return number;
}

// Parse an object
function parseObject(index: number, buffer: string): JsonObject {
    const result: JsonObject = {};
    index++; // Skip '{'
    skipWhitespace(index, buffer);

    if (buffer[index] === CONSTANTS.closeCurly) {
        index++; // Empty object
        return result;
    }

    while (index < buffer.length) {
        skipWhitespace(index, buffer);
        if (buffer[index] !== CONSTANTS.doubleQuote) {
            throw new SyntaxError("Expected property name in double quotes");
        }
        const key = parseString(index, buffer);
        skipWhitespace(index, buffer);
        if (buffer[index] !== CONSTANTS.colon) {
            throw new SyntaxError("Expected colon after property name");
        }
        index++; // Skip ':'
        skipWhitespace(index, buffer);
        result[key] = parseValue(index, buffer);
        skipWhitespace(index, buffer);

        if (buffer[index] === CONSTANTS.closeCurly) {
            index++; // End of object
            return result;
        }
        if (buffer[index] !== CONSTANTS.comma) {
            throw new SyntaxError("Expected comma after property");
        }
        index++; // Skip ','
    }

    throw new SyntaxError("Unterminated object");
}

// Parse an array
function parseArray(index: number, buffer: string): JsonArray {
    const result: JsonArray = [];
    index++; // Skip '['
    skipWhitespace(index, buffer);

    if (buffer[index] === CONSTANTS.closeSquare) {
        index++; // Empty array
        return result;
    }

    while (index < buffer.length) {
        result.push(parseValue(index, buffer));
        skipWhitespace(index, buffer);

        if (buffer[index] === CONSTANTS.closeSquare) {
            index++; // End of array
            return result;
        }
        if (buffer[index] !== CONSTANTS.comma) {
            throw new SyntaxError("Expected comma after array element");
        }
        index++; // Skip ','
    }

    throw new SyntaxError("Unterminated array");
}

// Parse a string
function parseString(index: number, buffer: string): string {
    if (buffer[index] !== CONSTANTS.doubleQuote) {
        throw new SyntaxError("Expected opening double quote for string");
    }
    index++; // Skip opening quote

    let result = "";
    while (index < buffer.length) {
        const char = buffer[index];
        if (char === CONSTANTS.doubleQuote) {
            index++; // Skip closing quote
            return result;
        }
        if (char === CONSTANTS.escapeSequences.backslash) {
            index++; // Handle escape sequence
            const escapeChar = buffer[index];
            if (escapeChar === CONSTANTS.doubleQuote) {
                result += CONSTANTS.doubleQuote;
            } else if (escapeChar === CONSTANTS.escapeSequences.backslash) {
                result += CONSTANTS.escapeSequences.backslash;
            } else if (escapeChar === CONSTANTS.escapeSequences.forwardslash) {
                result += CONSTANTS.escapeSequences.forwardslash;
            } else if (escapeChar === CONSTANTS.escapeSequences.b) {
                result += CONSTANTS.escapeSequences.backspace;
            } else if (escapeChar === CONSTANTS.escapeSequences.f) {
                result += CONSTANTS.escapeSequences.formFeed;
            } else if (escapeChar === CONSTANTS.escapeSequences.n) {
                result += CONSTANTS.escapeSequences.newline;
            } else if (escapeChar === CONSTANTS.escapeSequences.r) {
                result += CONSTANTS.escapeSequences.carriageReturn;
            } else if (escapeChar === CONSTANTS.escapeSequences.t) {
                result += CONSTANTS.escapeSequences.tab;
            } else {
                throw new SyntaxError(`Invalid escape sequence \\${escapeChar}`);
            }
        } else {
            result += char;
        }
        index++;
    }

    throw new SyntaxError("Unterminated string");
}

// Helper to skip whitespace
function skipWhitespace(index: number, buffer: string): void {
    while (CONSTANTS.regexs.space.test(buffer[index])) {
        index++;
    }
}

// Parse JSON value
function parseValue(index: number, buffer: string): JsonValue {
    skipWhitespace(index, buffer);
    const char = buffer[index];

    if (char === CONSTANTS.openCurly) {
        return parseObject(index, buffer);
    }
    if (char === CONSTANTS.openSquare) {
        return parseArray(index, buffer);
    }
    if (char === CONSTANTS.doubleQuote) {
        return parseString(index, buffer);
    }
    if (char === CONSTANTS.minus || CONSTANTS.regexs.number.test(char)) {
        return parseNumber(index, buffer);
    }
    if (buffer.startsWith(CONSTANTS.true, index)) {
        index += 4;
        return true;
    }
    if (buffer.startsWith(CONSTANTS.false, index)) {
        index += 5;
        return false;
    }
    if (buffer.startsWith(CONSTANTS.null, index)) {
        index += 4;
        return null;
    }

    throw new SyntaxError(`Unexpected token at index ${index}: '${char}'`);
}

// TODO:  Doesn't work

/**
 * A generator function that parses JSON incrementally from a buffer.
 * @yields Parsed JSON values as they are fully formed in the buffer.
 */
export function* parseJsonStream(
    maxRetries = 3, // Maximum number of retries for incomplete chunks
): Generator<JsonValue, void, Buffer | undefined> {
    let buffer = ""; // Accumulates incoming chunks
    let index = 0; // Tracks the current position in the buffer
    let retries = 0; // Counter for retry attempts

    while (true) {
        const chunk: Buffer | undefined = yield; // Wait for the next chunk

        if (chunk) {
            buffer += chunk.toString(); // Append new data to the buffer
            retries = 0; // Reset retries on new data
        }

        while (index < buffer.length) {
            try {
                const value = parseValue(index, buffer); // Attempt to parse a value
                yield value;

                // Adjust the buffer to remove parsed data
                buffer = buffer.slice(index);
                index = 0; // Reset index for the trimmed buffer
                retries = 0; // Reset retries on successful parse
            } catch (error) {
                if (error instanceof SyntaxError) {
                    if (index < buffer.length) {
                        // Likely incomplete JSON; wait for more data
                        retries++;
                        if (retries > maxRetries) {
                            throw new SyntaxError(`Incomplete JSON or invalid data after ${maxRetries} retries`);
                        }
                        break; // Wait for the next chunk
                    }
                }
                throw error; // Re-throw unrecoverable errors
            }
        }
    }
}
