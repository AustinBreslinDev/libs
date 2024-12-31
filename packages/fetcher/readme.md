# Fetcher: A wrapper around Fetch for convenience

Fetcher is a library built on top of `fetch` API to make http requests in your web applications.
It provides similar APIs to `fetch`, but doesn't require as much boilerplate code.

## Why use fetcher?

### Simplicity

Fetcher makes it easier to perform HTTP requests in your JavaScript or TypeScript projects.
It abstracts away the complexities of the `fetch` API, allowing you to focus on writing your application's logic
without worrying about low-level details. You also don't have to check if the HTTP Request was OK either.

### Error Handling

Unlike `fetch`, Fetcher doesn't throw errors. Instead, it resolves a promise with an error (if there is one) and the result of the request.
This makes it easier to handle errors in your application's code.

### Features

Fetcher supports all methods provided by the `fetch` API: `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`.
It also supports response formats such as JSON, text, blob, bytes, form data, array buffer, and cloned responses.
Fetcher has more features than the fetch API.

## Extra Features

### TypeScript Support

Fetcher is fully supported in TypeScript, allowing you to take advantage of TypeScript's powerful type checking features.
This helps catch errors at compile time and makes your code more robust.

### Modules

Fetcher is available as both CommonJS and ES modules, making it easy to use in a variety of project setups.

### Installation

You can install Fetcher using npm:

```terminal
npm install --save @austinbreslin/core-utils
```

Or pnpm:

```terminal
pnpm install @austinbreslin/core-utils 
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
