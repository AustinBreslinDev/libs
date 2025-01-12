import { mergeConfig } from "vite";
import { baseVite } from "./baseVite";
import react from "@vitejs/plugin-react";
import { findFilesWithUseClient } from "./findFilesWithUseClient";
import { findFilesByGlob } from "./findFilesByGlob";

const buildFrontend = async () => {
    const filesWithClient = await findFilesWithUseClient();

    const sourceFiles = findFilesByGlob(["src/**/*.tsx", "src/**/*.ts"]);

    const entries = sourceFiles.reduce(
        (acc, path) => {
            const key = path.replace(/^src\//, "").replace(/\.(ts|tsx)$/, "");
            acc[key as keyof typeof acc] = `./${path}`;
            return acc;
        },
        {} as { [key: string]: string },
    );

    Object.keys(filesWithClient).map((x) => delete entries[x]);

    const merged = mergeConfig(baseVite, {
        plugins: [react()],
        ssr: {
            target: "node",
        },
        build: {
            lib: {
                entry: entries,
            },
            rollupOptions: {
                external: ["react", "react-dom", "react/jsx-runtime", "react-icons", "react-icons/lu"],
            },
        },
    });

    merged.build.lib.entry = entries;
    return merged;
};

export const frontendVite = buildFrontend;
