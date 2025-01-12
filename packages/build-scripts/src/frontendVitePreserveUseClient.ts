import { mergeConfig } from "vite";
import { frontendVite } from "./frontendVite";
import { findFilesWithUseClient } from "./findFilesWithUseClient";

export const frontendVitePreserveUseClient = async () => {
    const entries = await findFilesWithUseClient();
    const frontend = await frontendVite();

    const merged = mergeConfig(frontend, {
        build: {
            lib: {
                entry: entries,
            },
            rollupOptions: {
                output: {
                    banner: '"use client";',
                },
                external: ["react", "react-dom", "react/jsx-runtime", "react-icons", "react-icons/lu"],
            },
        },
    });

    merged.build.lib.entry = entries;
    return merged;
};
