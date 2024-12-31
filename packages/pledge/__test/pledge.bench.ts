import { describe, bench } from "vitest";
import { pledge, pledgify } from "../src/index.js";

const benchOpts = {
    time: 500,
    iterations: 1_000_000,
    warmupIterations: 1,
};

describe("pledge", () => {
    bench(
        "promise",
        async () => {
            const testResult: { err: any; res: any } = { err: undefined, res: undefined };

            try {
                const res = await Promise.resolve(null);
                testResult.res = res;
            } catch (error) {
                testResult.err = error;
            }
        },
        { time: 500, iterations: 100_000, warmupIterations: 2 },
    );

    bench(
        "normal usage of pledge",
        async () => {
            const promise = Promise.resolve(null);
            const [err, res] = await pledge(promise);
            const testResult = { err, res };
        },
        benchOpts,
    );
});

describe("pledgify", () => {
    const test = (cb: any) => {
        cb(new Error("Benchmark test"));
    };

    const prePledged = pledgify(test);

    bench(
        "try catch",
        () => {
            const errors: any[] = [];
            try {
                test((err) => {
                    if (err) {
                        errors.push(err);
                    }
                });
            } catch (error) {
                errors.push(error);
            }
        },
        benchOpts,
    );

    bench(
        "normal usage of pledgify",
        async () => {
            const errors: any[] = [];
            const [_err] = await pledgify(test)();
            errors.push(_err);
        },
        benchOpts,
    );

    bench(
        "pre pledged usage",
        async () => {
            const errors: any[] = [];
            const [_err] = await prePledged();
            errors.push(_err);
        },
        benchOpts,
    );
});
