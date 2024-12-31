import { mergeConfig } from "vite";
import { serverVite } from "../build-scripts/src/serverVite.js";

export default mergeConfig(serverVite, {
    ssr: {
        noExternal: true,
    },
});
