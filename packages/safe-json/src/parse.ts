/**
 * Safely parses a JSON string into an object of type T, with optional reviver logic.
 *
 * @template T - The expected type of the parsed JSON object.
 * @param {string} potentialObject - The JSON string to parse.
 * @param {(this: any, key: string, value: any) => any} [reviver] - Optional function to transform the parsed values.
 * @returns {[Error | undefined, T | undefined]} - A tuple containing:
 *    - An Error if parsing fails, otherwise `undefined`.
 *    - The parsed object of type T if successful, otherwise `undefined`.
 */
export const parse = <T>(
    potentialObject: string,
    reviver?: (this: any, key: string, value: any) => any,
): [Error | undefined, T | undefined] => {
    // Return early if the input is empty or invalid JSON
    if (!potentialObject || potentialObject === "undefined") {
        return [undefined, undefined];
    }

    try {
        // Attempt to parse the JSON string
        const result = JSON.parse(potentialObject, reviver);
        return [undefined, result];
    } catch (error) {
        // Return the error and undefined if parsing fails
        return [error instanceof Error ? error : new Error(String(error)), undefined];
    }
};
