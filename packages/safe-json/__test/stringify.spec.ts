import { describe, it, expect } from "vitest";
import { stringify } from "../src/stringify";

describe("stringify", () => {
    it("should correctly stringify a simple object", () => {
        const input = { name: "John", age: 30 };
        const [error, result] = stringify(input);

        expect(error).toBeUndefined();
        expect(result).toEqual('{"name":"John","age":30}');
    });

    it("should handle stringifying null", () => {
        const input = null;
        const [error, result] = stringify(input);

        expect(error).toBeUndefined();
        expect(result).toEqual("null");
    });

    it("should stringify arrays", () => {
        const input = [1, "test", true];
        const [error, result] = stringify(input);

        expect(error).toBeUndefined();
        expect(result).toEqual('[1,"test",true]');
    });

    it("should handle undefined values in objects", () => {
        const input = { name: "John", age: undefined };
        const [error, result] = stringify(input);

        expect(error).toBeUndefined();
        expect(result).toEqual('{"name":"John"}'); // `undefined` is omitted in JSON
    });

    it("should handle BigInt values", () => {
        const input = { bigNumber: BigInt(12345678901234567890) };

        try {
            const [error, result] = stringify(input);
            expect(error).toBeUndefined();
            expect(result).toEqual('{"bigNumber":12345678901234567168}');
        } catch (shouldntThrow) {
            expect(shouldntThrow).toBeUndefined();
        }
    });

    it("should not throw an error for circular references", () => {
        const obj: any = {};
        obj.inner = obj; // Circular reference

        try {
            const [error, result] = stringify(obj);
            expect(error).toBeUndefined();
            expect(result).toEqual('{"inner":"$ref.root"}');
        } catch (shouldntThrow) {
            expect(shouldntThrow).toBeUndefined();
        }
    });

    it("should stringify dates as ISO strings", () => {
        const date = new Date("2023-01-01T00:00:00Z");
        const [error, result] = stringify({ date });

        expect(error).toBeUndefined();
        expect(result).toEqual('{"date":"2023-01-01T00:00:00.000Z"}');
    });

    it("should handle special characters in strings", () => {
        const input = { text: "Hello\nWorld\t" };
        const [error, result] = stringify(input);

        expect(error).toBeUndefined();
        expect(result).toEqual('{"text":"Hello\\nWorld\\t"}');
    });

    it("should handle NaN and Infinity values", () => {
        const input = { value1: Number.NaN, value2: Number.POSITIVE_INFINITY, value3: -Number.POSITIVE_INFINITY };
        const [error, result] = stringify(input);

        expect(error).toBeUndefined();
        expect(result).toEqual('{"value1":null,"value2":null,"value3":null}');
    });

    it("should omit functions in objects", () => {
        const input = {
            name: "John",
            greet: () => "Hello",
        };

        const [error, result] = stringify(input);

        expect(error).toBeUndefined();
        expect(result).toEqual('{"name":"John"}'); // Functions are not serialized
    });

    it("should stringify objects with custom toJSON methods", () => {
        const input = {
            name: "John",
            toJSON() {
                return { specialName: "Custom John" };
            },
        };
        const [error, result] = stringify(input);

        expect(error).toBeUndefined();
        expect(result).toEqual('{"specialName":"Custom John"}');
    });

    it("should stringify deeply nested objects", () => {
        const input = { level1: { level2: { level3: { value: "deep" } } } };
        const [error, result] = stringify(input);

        expect(error).toBeUndefined();
        expect(result).toEqual('{"level1":{"level2":{"level3":{"value":"deep"}}}}');
    });

    it("should handle objects with symbols", () => {
        const sym = Symbol("test");
        const input = { key: "value", [sym]: "hidden" };
        const [error, result] = stringify(input);

        expect(error).toBeUndefined();
        expect(result).toEqual('{"key":"value"}'); // Symbols are ignored in JSON
    });

    it("should not throw an error when an object contains cyclic references, even deep", () => {
        const obj: any = { level1: { level2: {} } };
        obj.level1.level2.cyclic = obj;

        const [error, result] = stringify(obj);
        expect(error).toBeUndefined();
        expect(result).toEqual('{"level1":{"level2":{"cyclic":"$ref.root"}}}');
    });

    it("should be able to handle an array containing a nested circular reference", () => {
        const obj: any = {};
        const array = [{ nested: obj }];
        obj.self = obj; // Create a circular reference

        const [error, result] = stringify(array);
        expect(error).toBeUndefined();
        expect(result).toEqual('[{"nested":{"self":"$ref.root.0.nested"}}]');
    });

    it("should be able to handle an array with a circular reference as an index", () => {
        const obj: any = {};
        const array: any[] = [];
        array.push(obj); // Add object to the array
        obj.self = array; // Create a circular reference to the array

        const [error, result] = stringify(array);
        expect(error).toBeUndefined();
        expect(result).toEqual('[{"self":"$ref.root"}]');
    });

    it("should serialize invalid Date objects as null", () => {
        const invalidDate = new Date("invalid-date"); // Creates an invalid Date object
        const [error, result] = stringify({ date: invalidDate });

        expect(error).toBeUndefined();
        expect(result).toBe('{"date":null}');
    });
});
