import { describe, expect, it } from "vitest";
import { parse } from "../src/parse";

describe("parseJSONStream Valid JSON Parsing", () => {
    it("parses numbers (integers, floats, negatives)", () => {
        expect(parse("42")).toEqual([undefined, 42]);
        expect(parse("-42")).toEqual([undefined, -42]);
        expect(parse("3.14159")).toEqual([undefined, 3.14159]);
        expect(parse("1e10")).toEqual([undefined, 1e10]);
        expect(parse("-1.23e-4")).toEqual([undefined, -1.23e-4]);
    });

    it("parses booleans", () => {
        expect(parse("true")).toEqual([undefined, true]);
        expect(parse("false")).toEqual([undefined, false]);
    });

    it("parses null", () => {
        expect(parse("null")).toEqual([undefined, null]);
    });

    it("parses strings (basic, escape sequences, Unicode)", () => {
        expect(parse('"hello"')).toEqual([undefined, "hello"]);
        expect(parse('"hello\\nworld"')).toEqual([undefined, "hello\nworld"]);
        expect(parse('"quote: \\"inside\\" text"')).toEqual([undefined, 'quote: "inside" text']);
        expect(parse('"emoji: 😀"')).toEqual([undefined, "emoji: 😀"]);
        expect(parse('"\\u0041"')).toEqual([undefined, "A"]); // Unicode escape
        expect(parse('"日本語"')).toEqual([undefined, "日本語"]); // Japanese characters
    });

    it("parses arrays", () => {
        expect(parse("[]")).toEqual([undefined, []]);
        expect(parse("[1, 2, 3]")).toEqual([undefined, [1, 2, 3]]);
        expect(parse('["a", "b", "c"]')).toEqual([undefined, ["a", "b", "c"]]);
        expect(parse("[true, false, null]")).toEqual([undefined, [true, false, null]]);
    });

    it("parses objects", () => {
        expect(parse("{}")).toEqual([undefined, {}]);
        expect(parse('{"key": "value"}')).toEqual([undefined, { key: "value" }]);
        expect(parse('{"nested": {"key": "value"}}')).toEqual([
            undefined,
            {
                nested: { key: "value" },
            },
        ]);
        expect(parse('{"array": [1, 2, 3]}')).toEqual([
            undefined,
            {
                array: [1, 2, 3],
            },
        ]);
    });

    it("parses mixed structures incrementally", () => {
        const input = '{"array": [1, {"key": "value"}], "nullValue": null, "boolean": true}';
        const result = parse(input);
        expect(result).toEqual([
            undefined,
            {
                array: [1, { key: "value" }],
                nullValue: null,
                boolean: true,
            },
        ]);
    });
});

describe("parseJSONStream Invalid JSON Parsing", () => {
    it("fails on undefined", () => {
        expect(parse("undefined")).toEqual([undefined, undefined]);
    });

    it("fails on functions", () => {
        const [error] = parse("function() {}");
        expect(error?.message.toString().startsWith("Unexpected token 'u', \"function() {}\" is not valid JSON")).toBe(
            true,
        );
    });

    // it("fails on __proto__", () => {
    //     const [error] = parse('{"__proto__": "value"}');
    //     expect(error?.message).toEqual("");
    // });

    it("fails on unclosed objects", () => {
        const [error] = parse('{"key": "value"');
        expect(
            error?.message.toString().startsWith("Expected ',' or '}' after property value in JSON at position 15"),
        ).toBe(true);
    });

    it("fails on unclosed arrays", () => {
        const [error] = parse("[1, 2, 3");
        expect(
            error?.message.toString().startsWith("Expected ',' or ']' after array element in JSON at position 8"),
        ).toBe(true);
    });

    it("fails on invalid characters", () => {
        const [error] = parse('{"key" = "value"}');
        expect(error?.message.toString().startsWith("Expected ':' after property name in JSON at position 7")).toBe(
            true,
        );
    });

    it("fails on trailing commas", () => {
        const [error1] = parse("[1, 2, 3, ]");
        const [error2] = parse('{"key": "value",}');

        expect(error1?.message.toString().startsWith(`Unexpected token ']', "[1, 2, 3, ]" is not valid JSON`)).toBe(
            true,
        );
        expect(
            error2?.message.toString().startsWith("Expected double-quoted property name in JSON at position 16"),
        ).toBe(true);
    });

    it("fails on missing commas", () => {
        const [error1] = parse("[1 2 3]");
        const [error2] = parse('{"key1": "value1" "key2": "value2"}');

        expect(
            error1?.message.toString().startsWith("Expected ',' or ']' after array element in JSON at position 3"),
        ).toBe(true);
        expect(
            error2?.message.toString().startsWith("Expected ',' or '}' after property value in JSON at position 18"),
        ).toBe(true);
    });

    it("fails on invalid escape sequences", () => {
        const [error] = parse('"\\q"');

        expect(error?.message.toString().startsWith("Bad escaped character in JSON at position 2")).toBe(true);
    });

    it("fails on unterminated strings", () => {
        const [error] = parse('"unterminated');
        expect(error?.message.toString().startsWith("Unterminated string in JSON at position 13")).toBe(true);
    });
});
