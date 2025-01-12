import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
    plugins: [react(), dts(), tsconfigPaths()],
    cacheDir: "./.vite",
    build: {
        minify: true,
        lib: {
            entry: "src/index.ts",
            formats: ["es"],
            fileName: (format) => (format === "es" ? "index.js" : `index.${format}`),
        },
        rollupOptions: {
            external: ["react", "react-dom", "react/jsx-runtime", "react-icons", "react-icons/lu"],
            output: {
                preserveModules: true,
            },
        },
    },
    resolve: {},
});
