import { type PledgeResult, pledgeTimed, pledgeWait } from "@austinbreslin/pledge";

/** HTTP methods */
export const HttpMethods = {
    get: "GET",
    put: "PUT",
    post: "POST",
    patch: "PATCH",
    delete: "DELETE",
} as const;

/** Response format types */
export const ResponseFmtFns = {
    json: "json",
    text: "text",
    blob: "blob",
    bytes: "bytes",
    formData: "formData",
    arrayBuffer: "arrayBuffer",
    clone: "clone",
} as const;

/**
 * Error thrown when a HTTP request fails.
 */
export class PledgeFetchError extends Error {
    /** HTTP status of the request that caused the error */
    public status: number;

    constructor(method: string, url: string, status: number) {
        super(`${method}:${url} HTTP Request failed with status: ${status}`);
        this.status = status;
    }
}

/**
 * Error thrown when a HTTP request fails and the retry limit is reached.
 */
export class PledgeFetchRetryError extends Error {
    /** Original error that caused the retry limit to be reached */
    public originalError: Error;

    constructor(method: string, url: string, original: Error) {
        super(`${method}:${url} HTTP Request failed. Attempt Limit Reached`);
        this.originalError = original;
    }
}

export const fetcher = {
    get: innerFetch.bind(null, HttpMethods.get) as FetcherFn,
    post: innerFetch.bind(null, HttpMethods.post) as FetcherFn,
    put: innerFetch.bind(null, HttpMethods.put) as FetcherFn,
    delete: innerFetch.bind(null, HttpMethods.delete) as FetcherFn,
    patch: innerFetch.bind(null, HttpMethods.patch) as FetcherFn,
    all: fetchAllRequests,
    any: fetchAnyRequests,
} as const;

export type FetcherFn = (url: string, options?: PledgeFetchOptions) => ReturnType<typeof innerFetch>;

export type PledgeFetchOptions = Omit<RequestInit, "method"> & {
    /** defaults to true */
    retryOptions?: RetryOptions;
    timeoutOptions?: TimeoutOptions;
};

/**
 * Default configurations for `innerFetch`.
 */
const DEFAULT_RETRY_OPTIONS = {
    retryEnabled: true,
    retryLimit: 5,
    retryDelayMs: 50,
    retryStrategy: "exponential",
};

const DEFAULT_TIMEOUT_OPTIONS = {
    timeoutEnabled: true,
    timeLimitMs: 5000,
};

/**
 * Factory function for creating `innerFetch` functions with specified HTTP methods.
 */
function innerFetch(method: MethodValue, url: string, options: PledgeFetchOptions = {}) {
    const fullOptions = buildFullOptions(options, method);

    return {
        json: <T>() => pledgeFetch<T>(url, fullOptions, ResponseFmtFns.json),
        text: () => pledgeFetch<string>(url, fullOptions, ResponseFmtFns.text),
        blob: () => pledgeFetch<Blob>(url, fullOptions, ResponseFmtFns.blob),
        bytes: () => pledgeFetch<Uint8Array>(url, fullOptions, ResponseFmtFns.bytes),
        formData: () => pledgeFetch<FormData>(url, fullOptions, ResponseFmtFns.formData),
        arrayBuffer: () => pledgeFetch<ArrayBuffer>(url, fullOptions, ResponseFmtFns.arrayBuffer),
        clone: <T>() => pledgeFetch<T>(url, Object.assign(fullOptions), ResponseFmtFns.clone),
    } as const;
}

/**
 * Configuration for individual fetch requests in `fetcher.all` and `fetcher.any`.
 */
export type FetchRequestConfig = {
    method: MethodValue;
    url: string;
    options?: PledgeFetchOptions;
    responseParser?: keyof typeof ResponseFmtFns;
};

function buildFullOptions(options: PledgeFetchOptions, method: MethodValue) {
    // Merge options with defaults
    // Construct the full options object
    const fullOptions: FullFetchOptions = Object.assign({}, options, {
        method,
        retryOptions: Object.assign({}, DEFAULT_RETRY_OPTIONS, options.retryOptions || {}) as never,
        timeoutOptions: Object.assign({}, DEFAULT_TIMEOUT_OPTIONS, options.timeoutOptions || {}) as never,
    });

    return fullOptions;
}

/**
 * Executes multiple requests and succeeds only if all succeed.
 * @param requests Array of fetch request configurations.
 */
async function fetchAllRequests<T>(requests: FetchRequestConfig[]): Promise<PledgeResult<T>[]> {
    const fetchPromises = requests.map(({ method, url, options, responseParser }) =>
        pledgeFetch<T>(url, buildFullOptions(options || {}, method), ResponseFmtFns[responseParser || "json"]),
    );
    return Promise.all(fetchPromises).catch((err) => [[err as Error, undefined]]);
}

/**
 * Executes multiple requests and succeeds if at least one succeeds.
 * @param requests Array of fetch request configurations.
 */
async function fetchAnyRequests<T>(requests: FetchRequestConfig[]): Promise<PledgeResult<T>> {
    const fetchPromises = requests.map(({ method, url, options, responseParser }) =>
        pledgeFetch<T>(url, buildFullOptions(options || {}, method), ResponseFmtFns[responseParser || "json"]),
    );
    return Promise.any(fetchPromises).catch((err) => [err as Error, undefined]);
}

/**
 * Wrapper around `fetch` that checks the response's status and throws an error if it's not ok.
 */
async function fetchWithOkCheck(url: string, options: RequestInit) {
    const res = await fetch(url, options);
    if (!res.ok) {
        throw new PledgeFetchError(options.method || HttpMethods.get, url, res.status);
    }
    return res;
}

/**
 * Wrapper around `fetchWithOkCheck` that retries the request if it fails and the retry limit has not been reached.
 */
async function fetchWithRetry(url: string, options: FullFetchOptions, attemptCount = 0, prevErr?: Error | undefined) {
    options.signal?.throwIfAborted();
    const { retryOptions } = options;

    const { retryLimit, retryDelayMs } = retryOptions;
    if (attemptCount === retryLimit) {
        return Promise.reject(prevErr);
    }

    const waitTime = retryDelayMs * 2 ** attemptCount;
    const [err, res] = await pledgeWait(waitTime, fetchWithOkCheck.bind(null, url, options));
    if (err) {
        return fetchWithRetry(url, options, attemptCount + 1, err);
    }
    return Promise.resolve(res);
}

/**
 * Wrapper around `fetchWithRetry` that handles timeouts and returns the desired response format.
 */
async function pledgeFetch<T>(url: string, options: FullFetchOptions, fn: FetchMethodValue) {
    const timeoutLimit = options.timeoutOptions.timeLimitMs || Number.POSITIVE_INFINITY;
    return await pledgeTimed<T>(
        fetchWithRetry(url, options).then((res) => res?.[fn]()),
        timeoutLimit,
    );
}

type RetryOptions = {
    /** defaults to 5 */
    retryLimit: number;
    /** defaults to exponential */
    retryStrategy: "static" | "exponential";
    /** defaults to 50 */
    retryDelayMs: number;
    /** defaults to true */
    retryEnabled?: boolean;
};

type TimeoutOptions = {
    /** defaults to true */
    timeoutEnabled: boolean;
    /** defaults to 5 seconds */
    timeLimitMs: number;
};

type FullFetchOptions = PledgeFetchOptions & { method: MethodValue } & {
    retryOptions: RetryOptions;
    timeoutOptions: TimeoutOptions;
};

type MethodKey = keyof typeof HttpMethods;
type MethodValue = (typeof HttpMethods)[MethodKey];

type FetchMethodKey = keyof typeof ResponseFmtFns;
type FetchMethodValue = (typeof ResponseFmtFns)[FetchMethodKey];
