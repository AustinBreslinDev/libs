import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import tsconfigPaths from "vite-tsconfig-paths";
import { join } from "node:path";
import { findFilesByGlob } from "./findFilesByGlob.js";

const sourceFiles = findFilesByGlob(["src/**/*.tsx", "src/**/*.ts"]);
const sourceFolderRegex = /^src\//;
const tsOrTsxExtRegex = /\.(ts|tsx)$/;

const entries = sourceFiles.reduce(
    (acc, path) => {
        const key = path.replace(sourceFolderRegex, "").replace(tsOrTsxExtRegex, "");
        acc[key as keyof typeof acc] = `./${path}`;
        return acc;
    },
    {} as { [key: string]: string },
);

const isProd = process.env.NODE_ENV === "production";

const merged = defineConfig({
    cacheDir: join(process.cwd(), "./.vite"),
    plugins: [dts({ entryRoot: join(process.cwd(), "./src") }), tsconfigPaths()],
    build: {
        minify: isProd,
        emptyOutDir: isProd,
        lib: {
            entry: "./src/",
            formats: ["es", "cjs"],
            fileName: (format, entryName) => {
                let newName = entryName;
                if (entryName?.startsWith("index")) {
                    newName = "index";
                }
                return format === "es" ? `${newName}.js` : `${newName}.${format}`;
            },
        },
        rollupOptions: {
            treeshake: isProd ? "smallest" : "safest",
        },
    },
});

if (merged?.build?.lib) {
    merged.build.lib.entry = entries;
}

export const baseVite = merged;
