import { describe, it, expect, vi } from "vitest";
import { fetcher, type FetchRequestConfig, ResponseFmtFns } from "../src/index.js";

describe("fetcher", () => {
    it("should make a GET request and return JSON data", async () => {
        const url = "https://jsonplaceholder.typicode.com/posts/1/";
        const expectedData = {
            id: 1,
            title: "sunt aut facere repellat provident occaecati excepturi optio repudiandae",
            body: "quia et suscipit\nsuscipit",
        };

        globalThis.fetch = vi.fn().mockResolvedValueOnce(
            Promise.resolve({
                json: () => Promise.resolve(expectedData),
                clone: () =>
                    Promise.resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve(JSON.parse(JSON.stringify(expectedData))),
                    }),
                ok: true,
                status: 200,
            }),
        );

        const [err, result] = await fetcher.get(url).json();
        expect(err).toBeUndefined();

        expect(result).toEqual(expectedData);
    });

    it("should make a POST request and return JSON data", async () => {
        const url = "https://jsonplaceholder.typicode.com/posts";
        const expectedData = { id: 101, title: "Test Post", body: "This is a test post" };

        globalThis.fetch = vi.fn().mockResolvedValueOnce({
            json: () => Promise.resolve(expectedData),
            clone: () =>
                Promise.resolve({
                    json: () => Promise.resolve(expectedData),
                    ok: true,
                    status: 200,
                }),
            ok: true,
            status: 201,
        });

        const [, result] = await fetcher
            .post(url, {
                body: JSON.stringify({ title: "Test Post", body: "This is a test post" }),
            })
            .json();

        expect(result).toEqual(expectedData);
    });

    it("should make a PUT request and return JSON data", async () => {
        const url = "https://jsonplaceholder.typicode.com/posts/1";
        const expectedData = { id: 1, title: "Updated Post", body: "This is an updated post" };

        globalThis.fetch = vi.fn().mockResolvedValueOnce({
            json: () => Promise.resolve(expectedData),
            clone: () =>
                Promise.resolve({
                    json: () => Promise.resolve(expectedData),
                    ok: true,
                    status: 200,
                }),
            ok: true,
            status: 200,
        });

        const [, result] = await fetcher
            .put(url, {
                body: JSON.stringify({ title: "Updated Post", body: "This is an updated post" }),
            })
            .json();

        expect(result).toEqual(expectedData);
    });

    it("should make a DELETE request and return JSON data", async () => {
        const url = "https://jsonplaceholder.typicode.com/posts/1";
        const expectedData = { id: 1 };

        globalThis.fetch = vi.fn().mockResolvedValueOnce({
            json: () => Promise.resolve(expectedData),
            clone: () =>
                Promise.resolve({
                    ok: true,
                    status: 204,
                    json: () => Promise.resolve(expectedData),
                }),
            ok: true,
            status: 204,
        });

        const [, result] = await fetcher.delete(url).json();

        expect(result).toEqual(expectedData);
    });

    it("should make a PATCH request and return JSON data", async () => {
        const url = "https://jsonplaceholder.typicode.com/posts/1";
        const expectedData = { id: 1, title: "Updated Post", body: "This is an updated post" };

        globalThis.fetch = vi.fn().mockResolvedValueOnce({
            json: () => Promise.resolve(expectedData),
            clone: () =>
                Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve(expectedData),
                }),
            ok: true,
            status: 200,
        });

        const [, result] = await fetcher
            .patch(url, {
                body: JSON.stringify({ title: "Updated Post", body: "This is an updated post" }),
            })
            .json();

        expect(result).toEqual(expectedData);
    });

    it("should able return text data", async () => {
        const url = "https://jsonplaceholder.typicode.com/posts/1";
        const expectedData =
            "sunt aut facere repellat provident occaecati excepturi optio repudiandae quia et suscipit\nsuscipit";

        globalThis.fetch = vi.fn().mockResolvedValueOnce({
            text: () => Promise.resolve(expectedData),
            clone: () =>
                Promise.resolve({
                    ok: true,
                    status: 200,
                    text: () => Promise.resolve(expectedData),
                }),
            ok: true,
            status: 200,
        });

        const [, result] = await fetcher.get(url).text();

        expect(result).toEqual(expectedData);
    });

    it("should be able return blob data", async () => {
        const url = "https://jsonplaceholder.typicode.com/posts/1";
        const expectedData = new Blob([
            Buffer.from(
                "sunt aut facere repellat provident occaecati excepturi optio repudiandae quia et suscipit\nsuscipit",
                "utf8",
            ),
        ]);

        globalThis.fetch = vi.fn().mockResolvedValueOnce({
            blob: () => Promise.resolve(expectedData),
            ok: true,
            status: 200,
            clone: () =>
                Promise.resolve({
                    ok: true,
                    status: 200,
                    blob: async () => Promise.resolve(new Blob([Buffer.from(await expectedData.arrayBuffer())])),
                }),
        });

        const [, result] = await fetcher.get(url).blob();

        expect(result).toEqual(expectedData);
    });

    it("should able to return byte data", async () => {
        const url = "https://jsonplaceholder.typicode.com/posts/1";
        const expectedData = Buffer.from(
            "sunt aut facere repellat provident occaecati excepturi optio repudiandae quia et suscipit\nsuscipit",
            "utf8",
        );

        globalThis.fetch = vi.fn().mockResolvedValueOnce({
            clone: () =>
                Promise.resolve({
                    ok: true,
                    status: 200,
                    bytes: () => Promise.resolve(expectedData),
                }),
            bytes: () => Promise.resolve(expectedData),
            ok: true,
            status: 200,
        });

        const [, result] = await fetcher.get(url).bytes();

        expect(result).toEqual(expectedData);
    });

    it("should able to return form data", async () => {
        const url = "https://jsonplaceholder.typicode.com/posts/1";
        const expectedData = new FormData();
        expectedData.append("id", "1");
        expectedData.append(
            "title",
            "sunt aut facere repellat provident occaecati excepturi optio repudiandae quia et suscipit\nsuscipit",
        );
        expectedData.append("body", "quia et suscipit\nsuscipit");

        globalThis.fetch = vi.fn().mockResolvedValueOnce({
            clone: () =>
                Promise.resolve({
                    ok: true,
                    status: 200,
                    formData: () => Promise.resolve(expectedData),
                }),
            formData: () => Promise.resolve(expectedData),
            ok: true,
            status: 200,
        });

        const [, result] = await fetcher.get(url).formData();

        expect(result).toEqual(expectedData);
    });

    it("should be able to clone a fetch response", async () => {
        const url = "https://jsonplaceholder.typicode.com/posts/1";
        const expectedData = {
            id: 1,
            title: "sunt aut facere repellat provident occaecati excepturi optio repudiandae quia et suscipit\nsuscipit",
            body: "quia et suscipit\nsuscipit",
        };

        globalThis.fetch = vi.fn().mockResolvedValueOnce({
            ok: true,
            status: 200,
            clone: () => Promise.resolve({ json: () => Promise.resolve(expectedData) }),
        });

        const modifiedResponse = await fetcher
            .get(url)
            .clone()
            .then(([, x]: any) => x.json());

        expect(modifiedResponse).toEqual(expectedData);
    });

    it("fetcher.all should succeed when all requests succeed", async () => {
        const requests: FetchRequestConfig[] = [
            { method: "GET", url: "https://jsonplaceholder.typicode.com/posts/1", responseParser: ResponseFmtFns.json },
            { method: "POST", url: "https://jsonplaceholder.typicode.com/posts", responseParser: ResponseFmtFns.json },
        ];

        const responses = [
            { id: 1, title: "Post 1", body: "Content 1" },
            { id: 101, title: "New Post", body: "New Content" },
        ];

        globalThis.fetch = vi
            .fn()
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(responses[0]),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(responses[1]),
            });

        const results = await fetcher.all(requests);

        expect(results).toEqual([
            [undefined, responses[0]],
            [undefined, responses[1]],
        ]);
    });

    it("fetcher.all should fail if any request fails", async () => {
        const requests: FetchRequestConfig[] = [
            { method: "GET", url: "https://jsonplaceholder.typicode.com/posts/1", responseParser: ResponseFmtFns.json },
            { method: "POST", url: "https://jsonplaceholder.typicode.com/posts", responseParser: ResponseFmtFns.json },
        ];

        globalThis.fetch = vi
            .fn()
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ id: 1, title: "Post 1", body: "Content 1" }),
            })
            .mockRejectedValueOnce({
                ok: false,
                json: () => Promise.reject(new Error("Failed POST request")),
            });

        const results = await fetcher.all(requests);

        expect(results).toEqual([
            [undefined, { id: 1, title: "Post 1", body: "Content 1" }],
            [new Error("Failed POST request"), undefined],
        ]);
    });

    it("fetcher.any should succeed if at least one request succeeds", async () => {
        const requests: FetchRequestConfig[] = [
            { method: "GET", url: "https://jsonplaceholder.typicode.com/posts/1" },
            { method: "POST", url: "https://jsonplaceholder.typicode.com/posts" },
        ];

        globalThis.fetch = vi
            .fn()
            .mockRejectedValueOnce(new Error("Failed GET request"))
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ id: 101, title: "New Post", body: "New Content" }),
            });

        const [err, result] = await fetcher.any(requests);

        expect(err).toBeUndefined();
        expect(result).toEqual({ id: 101, title: "New Post", body: "New Content" });
    });

    it("fetcher.any should fail if all requests fail", async () => {
        const requests: FetchRequestConfig[] = [
            { method: "GET", url: "https://jsonplaceholder.typicode.com/posts/1" },
            { method: "POST", url: "https://jsonplaceholder.typicode.com/posts" },
        ];

        globalThis.fetch = vi
            .fn()
            .mockRejectedValueOnce(new Error("Failed GET request"))
            .mockRejectedValueOnce(new Error("Failed POST request"));

        const [err, result] = await fetcher.any(requests);

        expect(result).toBeUndefined();
        expect(err).toBeUndefined();
    });
});
