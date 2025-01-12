# Fetcher: A wrapper around Fetch for convenience

<!--toc:start-->

- [Fetcher: A wrapper around Fetch for convenience](#fetcher-a-wrapper-around-fetch-for-convenience)
  - [Why use fetcher?](#why-use-fetcher)
    - [Simplicity](#simplicity)
    - [Error Handling](#error-handling)
    - [Features](#features)
  - [Extra Features](#extra-features)
    - [TypeScript Support](#typescript-support)
    - [Modules](#modules)
    - [Timeout option](#timeout-option)
    - [Fetch implementation](#fetch-implementation)
    - [JSON Parse implementation](#json-parse-implementation)
    - [Installation](#installation)
  - [Usage](#usage)
  - [Dependencies](#dependencies)

<!--toc:end-->

Fetcher is a library built on top of `fetch` API to make http requests in your web applications.
It provides similar APIs to `fetch`, but doesn't require as much boilerplate code.

## Why use fetcher?

### Simplicity

Fetcher makes it easier to perform HTTP requests in your JavaScript or TypeScript projects.
It abstracts away the complexities of the `fetch` API, allowing you to focus on writing your application's logic
without worrying about low-level details. You also don't have to check if the HTTP Request was OK either.

### Error Handling

Unlike `fetch`, Fetcher doesn't throw errors. Instead, it resolves a promise with an error (if there is one)
and the result of the request. This makes it easier to handle errors in your application's code.

### Features

Fetcher supports all methods provided by the `fetch` API: `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`.
It also supports response formats such as JSON, text, blob, bytes, form data, array buffer, and cloned responses.
Fetcher has more features than the fetch API.

## Extra Features

### TypeScript Support

Fetcher is fully supported in TypeScript, allowing you to take advantage of TypeScript's powerful type checking
features. This helps catch errors at compile time and makes your code more robust.

### Modules

Fetcher is available as both CommonJS and ES modules, making it easy to use in a variety of project setups.
The packaged size is around 3kb, npm reports the TS definitions, both types of modules.

### Timeout option

Fetcher has a timeout option available for all requests.

```typescript
import { fetcher } from "@austinbreslin/fetcher";

// One second time limit. If time excedes limit, error will have a value.
const [error, result] = await fetcher("https://example.com", {
    timeoutOptions: {
        timeoutEnabled: true,
        timeLimitMs: 1000 
    }
});
```

### Fetch implementation

Fetcher allows you to supply your own implementation of the Fetch API. The reason for this is because in
NodeJS, you might have a scenario where you have to change some HTTP details for CORS or some other reason.
Fetcher doesn't want to prevent you from making an HTTP changes that you require.

There is a another effect of this, if you use an old version of NodeJS that doesn't have the Fetch API,
you can pass in a polyfilled implementation of that and still recieve all the goodnees of Fetcher.
While possible, Fetcher cannot support that polyfill, as it could deviate from the Standard, so
be particular about your package selections, if there is a standard please try to find a package
that most accurately follows that standard.

### JSON Parse implementation

Fetcher allows you to supply your own implementation of JSON parsing. This was added because the standard
JSON parse built into browsers/NodeJS works funny at best. So you might want to use a different parser,
such as `@austinbreslin/safe-json`

### Installation

You can install Fetcher using npm:

```terminal
npm install --save @austinbreslin/fetcher
```

Or pnpm:

```terminal
pnpm install @austinbreslin/fetcher 
```

## Usage

Here's an example of how to use Fetcher to make a GET request:

```typescript
import { fetcher } from '@austinbreslin/core-utils';

const [error, result] = await fetcher.get('https://jsonplaceholder.typicode.com/posts/1').json()
console.log({ error, result });
```

This will make a GET request to `https://jsonplaceholder.typicode.com/posts/1`,
and print the response data to the console.
If there is an error, it will be logged to the console instead.

## Dependencies

- [Pledge](<>) - Wraps promises preventing a lot of boilerplate code
