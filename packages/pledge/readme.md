# Pledge: A Promise Wrapper for Error Handling and Timed Functions

<!--toc:start-->

- [Pledge: A Promise Wrapper for Error Handling and Timed Functions](#pledge-a-promise-wrapper-for-error-handling-and-timed-functions)
  - [Installation](#installation)
  - [API](#api)
    - [newPledge](#newpledge)
    - [pledge](#pledge)
    - [pledgeTryCatch](#pledgetrycatch)
    - [pledgify](#pledgify)
    - [pledgeAll](#pledgeall)
    - [pledgeAllSettled](#pledgeallsettled)
    - [pledgeRace](#pledgerace)
    - [pledgeAny](#pledgeany)
    - [pledgeTimed](#pledgetimed)
    - [pledgeAllTimed](#pledgealltimed)
    - [pledgeAllSettledTimed](#pledgeallsettledtimed)
    - [pledgeWait](#pledgewait)

<!--toc:end-->

Pledge is a utility library designed to simplify error handling in JavaScript applications using Promises.
It provides functions that wrap promises, try-catch blocks, callback-based functions, and timed operations,
returning tuples instead of throwing errors.

- All pledge items return a tuple/array with the first item in the tuple being an Error | undefined and the second
  item in the tuple being of type T | undefined.
- Pledge has a type for this tuple called PledgeResult<T>
- All pledge functions take an optional parameter object that allows you to supply an abort controller, giving
  you the ability to cancel the execution of the promise at any time.
- Pledge has full Typescript support

## Installation

You can install Pledge via npm or pnpm:

**npm**

```terminal
npm install @austinbreslin/pledge
```

**pnpm**

```terminal
pnpm add @austinbreslin/pledge
```

## API

### newPledge

Allows you to reduce your boilerplate code for using pledge, by using the exact same constructor
used in new Promise.

***Signature***

```typescript
newPledge<T>(cb: (resolve: (value: T) => void, reject: (reason?: unknown) => void) => void): PledgeResult<T>
```

***Usage***

```javascript
import { newPledge } from "@austinbreslin/pledge";

const example = newPledge((resolve, reject) => {
  // do something as if your in a promise
  resolve({ example: 'data' });
});

const result = await example();
console.log(result); // [undefined, { example: 'data' }]
```

### pledge

Wraps an already constructed promise object and ensures it returns a tuple.

***Signature***

```typescript
async pledge<T>(Promise<T>, options?: { abortController: AbortController }): PledgeResult<T>
```

***Usage***

```javascript
import { pledge } from '@austinbreslin/pledge';

const result = await pledge(Promise.resolve({ example: 'data' }));
console.log(result); // [undefined, { example: 'data' }]
```

### pledgeTryCatch

Reduces the boilerplate code when you want to run code that could throw an error.

***Signature***

```typescript
<T>(fn: () => T) => void
```

***Usage***

```javascript
import { pledgeTryCatch } from "@austinbreslin/pledge";

const result = pledgeTryCatch<object>(() => {
    return JSON.parse('abc{}invalid');
});
console.log(result); // [SyntaxError: Unexpected token 'a', "abc{}invalid" is not valid JSON, undefined]
```

### pledgify

Converts a callback function into pledge wrapped promise.
This does not accept options as a second parameter.

***Signature***

```typescript
async <T>(fn: (...arguments: unknown[], callback: (err: Error | undefined, data: T | undefined) => void)) => void;
```

***Usage***

```javascript
import { pledgify } from "@austinbreslin/pledge";

const example = (toWhom, cb) => {
  // You shouldn't create callbacks anymore, but some old libraries will still
  // use this format.
  try {
    const parsed = JSON.parse(`abc{ hello: '${toWhom}'}invalid`);
    cb(undefined, parsed);
  } catch (error) {
    cb(error, undefined);
  }
};

const wrapped = pledgify(example);
const result = await wrapped("John Smith");
console.log(result); // [SyntaxError: Unexpected token, undefined]
```

### pledgeAll

An alternative to Promise.all that returns a tuple

***Signature***

```typescript
async <T>(promise: Promise[], options?: { abortController: AbortController }): PledgeResult<T>
```

***Usage***

```javascript
import { pledgeAll } from "@austinbreslin/pledge";

const promises = [
  fetch('https://example.com'),
  fetch('https://example.com')
];

const pledged = await pledgeAll(promises);
console.log(pledged); // [undefined, [fetch1:Response, fetch2:Response]]
```

### pledgeAllSettled

An alternative to Promise.allSettled, but returns an array of errors and an array of results
in the order you specified, unlike Promise.all which forces you to check each result to discover
if that promise failed or not.

***Signature***

```typescript
async <T>(promise: Promise[], options?: { abortController: AbortController }): [Error[], T[]]
```

***Usage***

```javascript
import { pledgeAllSettled } from "@austinbreslin/pledge";

const promises = [
  fetch('https://example.com'),
  fetch('invalidhttps://example.com'),
];

const pledged = await pledgeAllSettled(promises);
console.log(pledge); // [[undefined, net::ERR_NAME_NOT_RESOLVED], [Response, undefined]]
```

### pledgeRace

An alternative to Promise.race

**Signature**

```typescript
async <T>(promises: Promise[], options?: { abortController: AbortController }): PledgeResult<T>
```

**Usage**

```javascript
import { pledgeRace } from "@austinbreslin/pledge"

const promises = [
  fetch('https://example.com'),
  fetch('https://example.com'),
];

const pledged = await pledgeRace(promises);
console.log(pledged); // [undefined, Response]
```

### pledgeAny

An alternative to Promise.any

**Signature**

```typescript
async <T>(promises: Promise[], options?: { abortController: AbortController }): PledgeResult<T>
```

**Usage**

```javascript
import { pledgeAny } from "@austinbreslin/pledge";

const promises = [
  fetch('https://example.com'),
  fetch('invalidhttps://example.com')
];

const pledged = await pledgeAny(promises);
console.log(pledged); // [undefined, [Response]]
// Doesn't error out, because 1 passed
```

### pledgeTimed

An alternative to pledge, but with time options. It will cancel the promise if it
exceeds the set time. The time unit is milliseconds, and the default is 0ms.

**Signature**

```typescript
async <T>(promise: Promise<T>, timeoutMs: number, options?: { abortController: AbortController }): PledgeResult<T>
```

**Usage**

```javascript
import { pledgeTimed } from "@austinbreslin/pledge";

const pledged = await pledgeTimed(fetch('https://example.com'), 20);
console.log(pledged); // [Error('Pledge time out occurred at set time:'), undefined] 
```

### pledgeAllTimed

An alternative to pledgeAll, but with time options. It will cancel all the promises if any of them
exceed the set time. The time unit is milliseconds, and the default is 0ms.

**Signature**

```typescript
async <T>(promises: Promise[], timeoutMs: number, options?: { abortController: AbortController }): PledgeResult<T>
```

**Usage**

```javascript
import { pledgeAllTimed } from "@austinbreslin/pledge";

const promises = [
  fetch('https://example.com'),
  fetch('https://example.com')
];

const pledged = await pledgeAllTimed(promises, 20);
console.log(pledged); // [Error('Pledge time out occurred at set time:'), undefined]

const success = await pledgeAllTimed(promises, 2000);
console.log(success); // [undefined, [Response1, Response1]]
```

### pledgeAllSettledTimed

An alternative to pledgeAllSettled, but with time options. It will cancel all the promises if any of them
exceed the set time. The unit is milliseconds, and the default is 0ms.

**Signature**

```typescript
async <T>(promises: Promise[], timeoutMs: Number, options?: { abortController: AbortController }): [(Error | undefined)[], (T | undefined)[]]
```

**Usage**

```javascript
import { pledgeAllSettledTimed } from "@austinbreslin/pledge";

const promises = [
  fetch('https://example.com'),
  fetch('https://example.com')
];

const pledged = await pledgeAllSettledTimed(promises, 20);

console.log(pledged); // [[Error("Pledge time out occurred at set time: ")], undefined]
```

### pledgeWait

This is a helper function that will execute your promise function after a set period of time.
The time unit is milliseconds. The default wait time is 0ms.

**Signature**

```typescript
async <T>(promiseFn: () => Promise<T>) => PledgeResult<T>
```

**Usage**

```javascript
import { pledgeWait } from "@austinbreslin/pledge";

const promiseFn = fetch.bind(null, 'https://example.com');
const pledged = await pledgeWait(promiseFn);

console.log(pledged); // [undefined, Response] 
```
