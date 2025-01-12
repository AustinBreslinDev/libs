import fg from "fast-glob";

export const findFilesByGlob = (globs: string[], ignore?: string[]) => {
    const options = {
        cwd: process.cwd(),
        ignore: ignore,
    };

    let result: string[] = [];
    for (const glob of globs) {
        result = result.concat(fg.globSync(glob, options));
    }

    return result;
};
