import fs from "fs-extra";
import { pipeline } from "node:stream/promises";
import { exec } from "node:child_process";
import util from "node:util";
import mime from "mime";

const execPromise = util.promisify(exec);

type FileSigs = {
    filesigs: {
        "File description": string;
        "Header (hex)": string;
        "File extension": string;
        FileClass: string;
        "Header offset": string;
        "Trailer (hex)": string;
    }[];
};

type FileSigsParsed = {
    // description: string;
    fileExtensions: string[];
    fileClass: string;
    headerOffset: number;
    headerHex: number[];
    trailerHex: number[] | undefined;
    mimeTypes: (string | undefined)[];
}[];

const stringHexToHexArray = (x: string) => x.split(" ").map((y) => Number.parseInt(y, 16));

async function downloadAndExtractFile(url: string, outputPath: string) {
    // Step 1: Download the file
    if (fs.existsSync(outputPath)) {
        console.log("File exists");
    } else {
        const response = await fetch(url, { method: "GET" });

        if (!response.ok) {
            console.error(response);
            throw new Error("Failed to download");
        }

        // Step 2: Write the file to disk
        const writeStream = fs.createWriteStream(outputPath);
        await pipeline(response.body as any, writeStream);

        console.log("File downloaded successfully.");
    }

    // Step 3: Extract the zip file using external command
    const extractedPath = `${outputPath}-extracted`;
    if (fs.existsSync(extractedPath)) {
        console.log("Already extracted zip");
    } else {
        try {
            const { stderr } = await execPromise(`unzip ${outputPath} -d ${extractedPath}`);
            if (stderr) {
                throw new Error(`Stderr while extracting zip: ${stderr}`);
            }
            console.log("File extracted successfully.");
        } catch (error) {
            throw new Error(`Error extracting zip: ${error.message}`);
        }
    }

    // Step 4: Move the license into source code
    const extractedInnerDirPath = `${extractedPath}/FileSigs`;
    if (fs.existsSync(extractedInnerDirPath)) {
        console.log("Already moved license");
    } else {
        try {
            await fs.copyFile(`${extractedInnerDirPath}/GKA_software_license.pdf`, "./GKA_software_license.pdf");
        } catch (error) {
            throw new Error(`Failed to move license: ${error.message}`);
        }
    }

    // Step 5: Read the JSON file containing file signatures
    let fileSigs: FileSigs = { filesigs: [] } as FileSigs;
    const extractedFileSigsJson = `${extractedInnerDirPath}/file_sigs.json`;
    try {
        const fileSigsRaw = await fs.readFile(extractedFileSigsJson, { encoding: "utf8" });
        fileSigs = JSON.parse(fileSigsRaw);
    } catch (error) {
        throw new Error("Failed to import file signatures");
    }

    // Step 6: using mime types build fill out more info
    const result: FileSigsParsed = [];
    for (const signature of fileSigs.filesigs) {
        try {
            const headerHexRaw = signature["Header (hex)"];
            const headerOffsetRaw = signature["Header offset"];
            const trailerHexRaw = signature["Trailer (hex)"];
            const fileExtensionRaw = signature["File extension"];
            // const description = signature["File description"];
            const fileClass = signature.FileClass;

            const fileExtensions = fileExtensionRaw.split("|");

            result.push({
                // description,
                fileClass,
                fileExtensions,
                trailerHex: trailerHexRaw === "(null)" ? undefined : stringHexToHexArray(trailerHexRaw),
                headerHex: stringHexToHexArray(headerHexRaw),
                mimeTypes: fileExtensions.map((x) => x && mime.getType(x)).map((x) => (x === null ? undefined : x)),
                headerOffset: Number.parseInt(headerOffsetRaw),
            });
        } catch (error) {
            throw new Error(`Failed to parse signature: ${JSON.stringify(signature)}`);
        }
    }

    // Step 7: output the contents of results to our source code
    if (result.length > 0 && !fs.existsSync("./src/fileTypes.json")) {
        try {
            fs.writeFile("./src/fileTypes.json", JSON.stringify(result, null, 4), { encoding: "utf8" });
        } catch (error) {
            throw new Error("Failed to save the results");
        }
    }

    return result;
}

const url = "https://www.garykessler.net/software/FileSigs.zip";
const outputPath = "./FileSigs.zip";

downloadAndExtractFile(url, outputPath).then(console.log).catch(console.error);
