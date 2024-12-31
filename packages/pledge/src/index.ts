// Type Definitions
export type PledgeResult<T> = [Error | undefined, T | undefined];
export type MultiPledgeResult<T> = [(Error | undefined)[], (T | undefined)[]];

type PossibleCallbackFunction =
    | ((cb: (err: Error | undefined, data: unknown) => void) => void)
    | ((...args: [...unknown[], (err: Error | undefined, data: unknown) => void]) => void);
type PromiseFn<T> = (resolve: (value: T) => void, reject: (reason?: unknown) => void) => void;

/**
 * Wraps new Promise so it returns a tuple
 */
export const newPledge = <T>(cb: PromiseFn<T>) => pledge<T>(new Promise(cb));

/**
 * Wraps a promise and returns a tuple result.
 */
export const pledge = async <T>(
    promise: Promise<T>,
    options: { abortController?: AbortController } = {},
): Promise<PledgeResult<T>> => {
    try {
        const result = await promise;
        options.abortController?.signal.throwIfAborted();
        return [undefined, result as T];
    } catch (error) {
        return [error as Error, undefined];
    }
};

/**
 * A pledge version of try catch
 * @example
 * ```javascript
 * const [err, parsed] = await pledge(() => JSON.parse("a{}"));
 * ```
 */
export const pledgeTryCatch = <T>(fn: () => T) => {
    try {
        const res = fn();
        return [undefined, res];
    } catch (error) {
        return [error, undefined] as PledgeResult<T>;
    }
};

/**
 * Converts a callback-based function into a promise that returns a tuple.
 */
export const pledgify =
    <T>(fn: PossibleCallbackFunction) =>
    (...args: unknown[]): Promise<PledgeResult<T>> => {
        const { promise, resolve } = pledgeWithResolvers<PledgeResult<T>>();
        const callback = (err: Error | undefined, data: T | undefined) => resolve([err, data]);

        if (typeof fn === "function") {
            const isLastArgFn = typeof args[args.length - 1] === "function";
            if (isLastArgFn) {
                args.pop();
            }
            (fn as any)(...args, callback);
        } else {
            resolve([new Error("Invalid function provided to pledgify"), undefined]);
        }

        return promise;
    };

/**
 * A polyfill for Promise.withResolvers.
 */
export const pledgeWithResolvers = <T>() => {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;

    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return { resolve, reject, promise };
};

/**
 * An alternative to Promise.all that returns a tuple.
 */
export const pledgeAll = async <T>(
    promises: Promise<T>[],
    options: { abortController?: AbortController } = {},
): Promise<PledgeResult<T[]>> =>
    promises.length === 0 ? [undefined, undefined] : pledge(Promise.all(promises), options);

/**
 * An alternative to Promise.allSettled that returns a tuple of arrays.
 */
export const pledgeAllSettled = async <T>(
    promises: Promise<T>[],
    options: { abortController?: AbortController } = {},
): Promise<MultiPledgeResult<T>> => {
    try {
        const results = await Promise.allSettled(promises);
        options.abortController?.signal.throwIfAborted();
        return collectPromiseAllResults(results);
    } catch (error) {
        return [[error as Error], []];
    }
};

/**
 * Wraps Promise.race and returns a tuple.
 */
export const pledgeRace = async <T>(
    promises: Promise<T>[],
    options: { abortController?: AbortController } = {},
): Promise<PledgeResult<T>> =>
    promises.length === 0 ? [undefined, undefined] : pledge(Promise.race(promises), options);

/**
 * Wraps Promise.any and returns a tuple.
 */
export const pledgeAny = async <T>(
    promises: Promise<T>[],
    options: { abortController?: AbortController } = {},
): Promise<PledgeResult<T>> =>
    promises.length === 0 ? [undefined, undefined] : pledge(Promise.any(promises), options);

/**
 * Adds a timeout to a promise and returns a tuple.
 */
export const pledgeTimed = async <T>(
    promise: Promise<T>,
    timeoutMs = 0,
    options: { abortController?: AbortController } = {},
): Promise<PledgeResult<T>> => {
    if (!options.abortController) {
        options.abortController = new AbortController();
    }

    try {
        const result = await Promise.race([_genTimedPromise(timeoutMs, options as never), promise]);
        options.abortController.signal.throwIfAborted();
        return [undefined, result];
    } catch (error) {
        return [error as Error, undefined];
    }
};

/**
 * An alternative to Promise.all with a timeout that returns a tuple.
 */
export const pledgeAllTimed = async <T>(
    promises: Promise<T>[],
    timeoutMs: number,
    options: { abortController?: AbortController } = {},
): Promise<PledgeResult<T[]>> => {
    if (!options.abortController) {
        options.abortController = new AbortController();
    }

    try {
        const result = await Promise.race([_genTimedPromise(timeoutMs, options as never), Promise.all(promises)]);
        options.abortController?.signal.throwIfAborted();
        return [undefined, result as T[]];
    } catch (error) {
        return [error as Error, undefined];
    }
};

/**
 * An alternative to Promise.allSettled with a timeout that returns a tuple of arrays.
 */
export const pledgeAllSettledTimed = async <T>(
    promises: Promise<T>[],
    timeoutMs: number,
    options: { abortController?: AbortController } = {},
): Promise<MultiPledgeResult<T>> => {
    if (!options.abortController) {
        options.abortController = new AbortController();
    }

    try {
        const result = await Promise.race([
            _genTimedPromise(timeoutMs, options as never),
            Promise.allSettled(promises),
        ]);
        options.abortController?.signal.throwIfAborted();
        return collectPromiseAllResults(result as PromiseSettledResult<T>[]);
    } catch (error) {
        return [[error as Error], []];
    }
};

/**
 * Delays execution of a promise and returns a tuple.
 */
export const pledgeWait = <T>(timeout: number, promiseFn: () => Promise<T>) =>
    pledge<T>(
        new Promise<T>((resolve, reject) => {
            setTimeout(() => {
                promiseFn().then(resolve).catch(reject);
            }, timeout);
        }),
    );

/**
 * @internal
 * Stop breaking DRY, just creates a new Promise that rejects after set time.
 */
const _genTimedPromise = (timeout: number, options: { abortController: AbortController }): Promise<never> =>
    new Promise((_, reject) => {
        setTimeout(() => {
            const message = `Pledge time out occurred at set time: ${timeout}`;
            options.abortController.abort(new Error(message));
            reject(new Error(message));
        }, timeout);
    });

const collectPromiseAllResults = <T>(res: PromiseSettledResult<T>[]) => {
    const collected = res.reduce(
        (acc, curr) => {
            if (curr.status === "rejected") {
                acc[0].push(curr.reason);
                acc[1].push(undefined);
            } else {
                acc[0].push(undefined);
                acc[1].push(curr.value as never);
            }
            return acc;
        },
        [[], []] as [(Error | undefined)[], (T | undefined)[]],
    );
    if (collected[0].every((x) => x === undefined || x === null)) {
        collected[0] = [];
    }

    return collected as MultiPledgeResult<T>;
};
