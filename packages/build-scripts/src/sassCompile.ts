import * as sass from "sass";
import { join } from "node:path";
import { findFilesByGlob } from "./findFilesByGlob";
import { writeFileSync } from "node:fs";
import fs from "fs-extra";

const compileSass = () => {
    console.log("Compiling SASS files...");
    const files = findFilesByGlob(
        ["styles/**/*.scss", "styles/**/*.sass"],
        ["src/**/*.module.scss", "src/**/*.module.sass"],
    );

    fs.mkdirpSync(join(process.cwd(), "./dist/styles"));

    for (const file of files) {
        const compiledFile = sass.compile(file, { style: "compressed" });
        const outputFileName = join(process.cwd(), "./dist", file.replace(/\.(scss|sass)$/, ".css"));

        const folderPath = outputFileName.split("/").slice(0, -1).join("/");
        fs.mkdirpSync(folderPath);
        writeFileSync(outputFileName, compiledFile.css);
    }
    console.log("SASS files compiled successfully!");
};

if (process.argv.filter((arg) => arg === "--watch").length > 0) {
    compileSass();
    fs.watch(join(process.cwd(), "./styles"), { recursive: true }, (event, filename) => {
        if (filename && (filename.endsWith(".scss") || filename.endsWith(".sass"))) {
            compileSass();
        }
    });
} else {
    compileSass();
}
