import { createReadStream } from "node:fs";
import readline from "node:readline";

export async function readFirstLine(filePath: string) {
    const fileStream = createReadStream(filePath);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Number.POSITIVE_INFINITY,
    });

    for await (const line of rl) {
        // Return the first line and close the stream
        rl.close();
        return line;
    }
}
