import { join } from "node:path";
import { defineConfig, mergeConfig } from "vite";
import dts from "vite-plugin-dts";
import tsconfigPaths from "vite-tsconfig-paths";
import { baseVite } from "./baseVite.js";

const isProd = process.env.NODE_ENV === "production";

const nodeExternals = [
    "assert",
    "assert/strict",
    "async_hooks",
    "buffer",
    "child_process",
    "cluster",
    "console",
    "constants",
    "crypto",
    "dgram",
    "diagnostics_channel",
    "dns",
    "dns/promises",
    "domain",
    "events",
    "fs",
    "fs/promises",
    "http",
    "http2",
    "https",
    "inspector",
    "module",
    "net",
    "os",
    "path",
    "path/posix",
    "path/win32",
    "process",
    "punycode",
    "querystring",
    "readline",
    "readline/promises",
    "repl",
    "sea",
    "stream",
    "stream/consumers",
    "stream/promises",
    "stream/web",
    "string_decoder",
    "test",
    "test/reporters",
    "timers",
    "timers/promises",
    "tls",
    "trace_events",
    "tty",
    "url",
    "util",
    "util/types",
    "v8",
    "vm",
    "wasi",
    "worker_threads",
    "zlib",

    "node:assert",
    "node:assert/strict",
    "node:async_hooks",
    "node:buffer",
    "node:child_process",
    "node:cluster",
    "node:console",
    "node:constants",
    "node:crypto",
    "node:dgram",
    "node:diagnostics_channel",
    "node:dns",
    "node:dns/promises",
    "node:domain",
    "node:events",
    "node:fs",
    "node:fs/promises",
    "node:http",
    "node:http2",
    "node:https",
    "node:inspector",
    "node:module",
    "node:net",
    "node:os",
    "node:path",
    "node:path/posix",
    "node:path/win32",
    "node:process",
    "node:punycode",
    "node:querystring",
    "node:readline",
    "node:readline/promises",
    "node:repl",
    "node:sea",
    "node:stream",
    "node:stream/consumers",
    "node:stream/promises",
    "node:stream/web",
    "node:string_decoder",
    "node:test",
    "node:test/reporters",
    "node:timers",
    "node:timers/promises",
    "node:tls",
    "node:trace_events",
    "node:tty",
    "node:url",
    "node:util",
    "node:util/types",
    "node:v8",
    "node:vm",
    "node:wasi",
    "node:worker_threads",
    "node:zlib",
];

export const serverVite = defineConfig({
    ssr: {
        target: "node",
    },
    cacheDir: join(process.cwd(), "./.vite"),
    plugins: [dts({ entryRoot: join(process.cwd(), "./src") }), tsconfigPaths()],
    build: {
        minify: isProd,
        emptyOutDir: isProd,
        lib: {
            entry: "./src/index.ts",
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
            external: nodeExternals,
            treeshake: isProd ? "smallest" : "safest",
            output: {
                preserveModules: false,
            },
        },
    },
});
