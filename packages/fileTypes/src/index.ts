import fileTypes from "./fileTypes.json" with { type: "json" };

export type FileType = {
    // description: string;
    fileExtensions: string[];
    fileClass: string;
    headerOffset: number;
    headerHex: number[];
    trailerHex: number[] | undefined;
    mimeTypes: (string | undefined)[];
};

export const FileTypes: FileType[] = fileTypes as unknown as FileType[];
