import { describe, it, expect } from "vitest";
import {
    pledge,
    pledgify,
    pledgeAll,
    pledgeTimed,
    pledgeAllTimed,
    pledgeAllSettled,
    pledgeAllSettledTimed,
    pledgeRace,
    pledgeAny,
    pledgeTryCatch,
} from "../src/index.js";

describe("pledge", () => {
    // Existing tests for pledge function
    it("should resolve successfully", async () => {
        const promise = Promise.resolve(42);
        const result = await pledge(promise);

        expect(result).toEqual([undefined, 42]);
    });

    it("should reject with an error", async () => {
        const promise = Promise.reject(new Error("Test Error"));
        const result = await pledge(promise);

        expect(result[0]).toBeInstanceOf(Error);
        expect(result[0]?.message).toBe("Test Error");
        expect(result[1]).toBeUndefined();
    });

    it("should handle null values", async () => {
        const promise: Promise<null> = Promise.resolve(null);
        const result = await pledge(promise);

        expect(result).toEqual([undefined, null]);
    });

    it("should accept a user provided abort controller", async () => {
        const abortController = new AbortController();
        const promise = new Promise<number>((resolve) => setTimeout(() => resolve(42), 200));

        setTimeout(() => {
            abortController.abort(new Error("Testing"));
        }, 100);

        const [error] = await pledge(promise, { abortController });
        expect(error).toBeInstanceOf(Error);
        expect(error?.message).toEqual("Testing");
    });
});

describe("pledgify", () => {
    it("should convert a callback function to a promise", async () => {
        const callbackFn = (cb) => cb(undefined, 42);
        const result = pledgify(callbackFn);

        expect(await result()).toEqual([undefined, 42]);
    });

    it("should handle an error in the callback function", async () => {
        const error = new Error("Callback Error");
        const callbackFn = (cb) => cb(error, undefined);
        const newCb = pledgify(callbackFn);

        const [err, res] = await newCb();
        expect(err).toBeInstanceOf(Error);
        expect(err?.message).toBe("Callback Error");
        expect(res).toBeUndefined();
    });
});

describe("pledgeAll", () => {
    it("should resolve all promises successfully", async () => {
        const promises = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)];
        const result = await pledgeAll(promises);

        expect(result).toEqual([undefined, [1, 2, 3]]);
    });

    it("should reject with an error if any promise rejects", async () => {
        const promises = [Promise.resolve(1), Promise.reject(new Error("Error in second promise")), Promise.resolve(3)];
        const [error] = await pledgeAll(promises);
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe("Error in second promise");
    });

    it("should accept a user provided abort controller", async () => {
        const abortController = new AbortController();
        const promise = new Promise<number>((resolve) => setTimeout(() => resolve(42), 200));

        setTimeout(() => {
            abortController.abort(new Error("Testing"));
        }, 100);

        const [error] = await pledge(promise, { abortController });
        expect(error).toBeInstanceOf(Error);
        expect(error?.message).toEqual("Testing");
    });

    it("should accept a user provided abort controller", async () => {
        const abortController = new AbortController();
        const promise = new Promise<number>((resolve) => setTimeout(() => resolve(42), 200));
        const promise2 = new Promise<number>((resolve) => setTimeout(() => resolve(42), 200));

        setTimeout(() => {
            abortController.abort(new Error("Testing"));
        }, 100);

        const [error] = await pledgeAll([promise, promise2], { abortController });
        expect(error).toBeInstanceOf(Error);
        expect(error?.message).toEqual("Testing");
    });
});

describe("pledgeAllSettled", () => {
    it("should handle all settled promises", async () => {
        const promises = [Promise.resolve(1), Promise.reject(new Error("Error in second promise")), Promise.resolve(3)];
        const [errors, results] = await pledgeAllSettled(promises);

        expect(errors.length).toEqual(promises.length);
        expect(results.length).toEqual(promises.length);
        expect(errors[0]).toBeUndefined();
        expect(errors[1]?.message).toEqual("Error in second promise");
        expect(errors[2]).toBeUndefined();
        expect(results[0]).toEqual(1);
        expect(results[1]).toBeUndefined();
        expect(results[2]).toEqual(3);
    });

    it("should accept a user provided abort controller", async () => {
        const abortController = new AbortController();
        const promise = new Promise<number>((resolve) => setTimeout(() => resolve(42), 200));
        const promise2 = new Promise<number>((resolve) => setTimeout(() => resolve(42), 200));

        setTimeout(() => {
            abortController.abort(new Error("Testing"));
        }, 100);

        const [error] = await pledgeRace([promise, promise2], { abortController });
        expect(error).toBeInstanceOf(Error);
        expect(error?.message).toEqual("Testing");
    });
});

describe("pledgeRace", () => {
    it("should resolve with the fastest promise", async () => {
        const p1 = new Promise<number>((resolve) => setTimeout(() => resolve(1), 50));
        const p2 = new Promise<number>((resolve) => setTimeout(() => resolve(2), 30));

        const [err, result] = await pledgeRace([p1, p2]);
        expect(result).toEqual(2);
        expect(err).toBeUndefined();
    });

    it("should reject with the error from the fastest promise", async () => {
        const p1 = new Promise<number>((resolve) => setTimeout(() => resolve(1), 50));
        const p2 = new Promise<number>((_, reject) => setTimeout(() => reject(new Error("P2 Error")), 30));

        const [err, result] = await pledgeRace([p1, p2]);
        expect(err).toBeInstanceOf(Error);
        expect(err?.message).toEqual("P2 Error");
        expect(result).toBeUndefined();
    });

    it("should resolve with the first resolved promise", async () => {
        const p1 = new Promise<number>((resolve) => setTimeout(() => resolve(1), 50));
        const p2 = new Promise<number>((resolve) => resolve(2));

        const [err, result] = await pledgeRace([p1, p2]);
        expect(err).toBeUndefined();
        expect(result).toEqual(2);
    });

    it("should handle an empty array of promises", async () => {
        const [err, result] = await pledgeRace([]);
        expect(err).toBeUndefined();
        expect(result).toBeUndefined();
    });

    it("should accept a user provided abort controller", async () => {
        const abortController = new AbortController();
        const promise = new Promise<number>((resolve) => setTimeout(() => resolve(42), 200));
        const promise2 = new Promise<number>((resolve) => setTimeout(() => resolve(42), 200));

        setTimeout(() => {
            abortController.abort(new Error("Testing"));
        }, 100);

        const [error] = await pledgeRace([promise, promise2], { abortController });
        expect(error).toBeInstanceOf(Error);
        expect(error?.message).toEqual("Testing");
    });
});

describe("pledgeAny", () => {
    it("should resolve with the first resolved promise", async () => {
        const p1 = new Promise<number>((resolve) => setTimeout(() => resolve(1), 50));
        const p2 = new Promise<number>((resolve) => resolve(2));

        const [err, result] = await pledgeAny([p1, p2]);
        expect(err).toBeUndefined();
        expect(result).toEqual(2);
    });

    it("should reject with the aggregated error from all rejected promises", async () => {
        const p1 = new Promise<number>((_, reject) => setTimeout(() => reject(new Error("P1 Error")), 30));
        const p2 = new Promise<number>((_, reject) => setTimeout(() => reject(new Error("P2 Error")), 50));

        const [err, result] = await pledgeAny([p1, p2]);

        expect(result).toBeUndefined();
        expect(err?.message).toEqual("All promises were rejected");
    });

    it("should resolve when 1 resolves even with rejections", async () => {
        const p1 = new Promise<number>((_, reject) => setTimeout(() => reject(new Error("P1 Error")), 30));
        const p2 = new Promise<number>((resolve, _) => setTimeout(() => resolve(21), 50));

        const [err, result] = await pledgeAny([p1, p2]);

        expect(result).equal(21);
        expect(err).toBeUndefined();
    });

    it("should handle an empty array of promises", async () => {
        const [err, result] = await pledgeAny([]);

        expect(err).toBeUndefined();
        expect(result).toBeUndefined();
    });

    it("should accept a user provided abort controller", async () => {
        const abortController = new AbortController();
        const promise = new Promise<number>((resolve) => setTimeout(() => resolve(42), 200));
        const promise2 = new Promise<number>((resolve) => setTimeout(() => resolve(42), 200));

        setTimeout(() => {
            abortController.abort(new Error("Testing"));
        }, 100);

        const [error] = await pledgeAny([promise, promise2], { abortController });
        expect(error).toBeInstanceOf(Error);
        expect(error?.message).toEqual("Testing");
    });
});

describe("pledgeTryCatch", () => {
    it("should resolve with the result of the function if no error occurs", () => {
        const [err, result] = pledgeTryCatch(() => 42);
        expect(err).toBeUndefined();
        expect(result).toEqual(42);
    });

    it("should reject with the error from the function if an error occurs", () => {
        const [err, result] = pledgeTryCatch(() => {
            throw new Error("Test Error");
        });

        expect(err).toBeInstanceOf(Error);
        expect((err as Error)?.message).toEqual("Test Error");
        expect(result).toBeUndefined();
    });

    it("should handle synchronous errors correctly", () => {
        const [err, result] = pledgeTryCatch(() => JSON.parse("{"));
        expect(err).toBeInstanceOf(SyntaxError);
        expect(result).toBeUndefined();
    });

    it("should handle asynchronous errors correctly", () => {
        const [err, result] = pledgeTryCatch(() => {
            throw new Error("Async Test Error");
        });

        expect(err).toBeInstanceOf(Error);
        expect((err as Error)?.message).toEqual("Async Test Error");
        expect(result).toBeUndefined();
    });
});

describe("pledgeTimed", () => {
    it("should resolve before the timeout", async () => {
        const promise = Promise.resolve(42);
        const result = await pledgeTimed(promise, 100);

        expect(result).toEqual([undefined, 42]);
    });

    it("should reject due to timeout", async () => {
        const promise = new Promise<number>((resolve) => setTimeout(() => resolve(42), 200));
        const [error] = await pledgeTimed(promise, 10);
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe(`Pledge time out occurred at set time: ${10}`);
    });

    it("should accept a user provided abort controller", async () => {
        const abortController = new AbortController();
        const promise = new Promise<number>((resolve) => setTimeout(() => resolve(42), 200));

        setTimeout(() => {
            abortController.abort(new Error("Testing"));
        }, 100);

        const [error] = await pledgeTimed(promise, 300, { abortController });
        expect(error).toBeInstanceOf(Error);
        expect(error?.message).toEqual("Testing");
    });

    it("should accept a user provided abort controller", async () => {
        const abortController = new AbortController();
        const promise = new Promise<number>((resolve) => setTimeout(() => resolve(42), 200));

        setTimeout(() => {
            abortController.abort(new Error("Testing"));
        }, 100);

        const [error] = await pledgeTimed(promise, 400, { abortController });
        expect(error).toBeInstanceOf(Error);
        expect(error?.message).toEqual("Testing");
    });
});

describe("pledgeAllTimed", () => {
    it("should resolve all promises before the timeout", async () => {
        const promises = [
            Promise.resolve(1),
            Promise.resolve(2),
            new Promise<number>((resolve) => setTimeout(() => resolve(3), 100)),
        ];
        const [err, res] = await pledgeAllTimed(promises, 500);

        expect(err).toBeUndefined();
        expect(res).toEqual([1, 2, 3]);
    });

    it("should reject due to timeout", async () => {
        const promises = [
            Promise.resolve(1),
            new Promise<number>((resolve) => setTimeout(() => resolve(2), 100)),
            Promise.resolve(3),
        ];
        const [error] = await pledgeAllTimed(promises, 50);
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe(`Pledge time out occurred at set time: ${50}`);
    });

    it("should accept a user provided abort controller", async () => {
        const abortController = new AbortController();
        const promise = new Promise<number>((resolve) => setTimeout(() => resolve(42), 200));
        const promise2 = new Promise<number>((resolve) => setTimeout(() => resolve(42), 200));

        setTimeout(() => {
            abortController.abort(new Error("Testing"));
        }, 100);

        const [error] = await pledgeAllTimed([promise, promise2], 400, { abortController });
        expect(error).toBeInstanceOf(Error);
        expect(error?.message).toEqual("Testing");
    });
});

describe("pledgeAllSettledTimed", () => {
    it("should handle all settled promises before the timeout", async () => {
        const promises = [
            Promise.resolve(1),
            new Promise<number>((resolve) => setTimeout(() => resolve(2), 100)),
            Promise.resolve(3),
        ];
        const result = await pledgeAllSettledTimed(promises, 500);

        expect(result).toEqual([[], [1, 2, 3]]);
    });

    it("should reject due to timeout", async () => {
        const p1 = new Promise<number>((resolve) => setTimeout(() => resolve(1), 500));
        const p2 = new Promise<number>((resolve) => setTimeout(() => resolve(2), 300));

        const promises = [p1, p2];
        const [error] = await pledgeAllSettledTimed(promises, 100);
        expect(Array.isArray(error)).toEqual(true);
        expect(error[0]).toBeInstanceOf(Error);
        expect(error[0]?.message).toEqual(`Pledge time out occurred at set time: ${100}`);
    });

    it("should accept a user provided abort controller", async () => {
        const abortController = new AbortController();
        const promise = new Promise<number>((resolve) => setTimeout(() => resolve(42), 200));
        const promise2 = new Promise<number>((resolve) => setTimeout(() => resolve(42), 200));

        setTimeout(() => {
            abortController.abort(new Error("Testing"));
        }, 100);

        const [errors] = await pledgeAllSettledTimed([promise, promise2], 400, { abortController });
        expect(errors?.[0]).toBeInstanceOf(Error);
        expect(errors?.[0]?.message).toEqual("Testing");
    });
});
