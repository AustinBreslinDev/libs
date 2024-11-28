import { FileTypes } from "../src/index";
import { describe, it, expect } from "vitest";

describe("FileTypes", () => {
    it("should list some files", () => {
        for (let i = 0; i < 10; i++) {
            const fileType = FileTypes[i];
            expect(fileType.headerOffset).toBeDefined();
            expect(fileType.fileExtensions).toBeDefined();
            expect(fileType.fileClass).toBeDefined();
            expect(fileType.mimeTypes).toBeDefined();
            expect(fileType.description).toBeDefined();
            expect(fileType.headerHex).toBeDefined();

            expect(JSON.stringify(fileType)).toBeDefined();
        }
    });
});
