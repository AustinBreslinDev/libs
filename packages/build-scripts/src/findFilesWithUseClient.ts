import { readFirstLine } from "./readFirstLine";
import { findFilesByGlob } from "./findFilesByGlob";

export const findFilesWithUseClient = async () => {
    const sourceFiles = findFilesByGlob(["src/**/*.tsx", "src/**/*.ts"]);
    const filesWithUseClient: string[] = [];

    for (const path of sourceFiles) {
        const firstLine = await readFirstLine(path);

        if (firstLine === '"use client";') {
            filesWithUseClient.push(path);
        }
    }

    return filesWithUseClient.reduce(
        (acc, path) => {
            const key = path.replace(/^src\//, "").replace(/\.(ts|tsx)$/, "");
            acc[key as keyof typeof acc] = `./${path}`;
            return acc;
        },
        {} as { [key: string]: string },
    );
};
