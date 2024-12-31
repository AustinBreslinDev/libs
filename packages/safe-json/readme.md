# **Safe-JSON**: Handle JSON Safely in TypeScript and JavaScript

<!--toc:start-->

- [**Safe-JSON**: Handle JSON Safely in TypeScript and JavaScript](#safe-json-handle-json-safely-in-typescript-and-javascript)
  - [Why Use **Safe-JSON**?](#why-use-safe-json)
  - [Features](#features)
  - [Installation](#installation)
    - [npm](#npm)
    - [pnpm](#pnpm)
  - [Usage](#usage)
  - [Notes](#notes)
    - [Performance](#performance)
    - [Design Goals](#design-goals)
  - [Detailed Features](#detailed-features)
    - [Normalizing Null/Undefined/NaN/Invalid Dates](#normalizing-nullundefinednaninvalid-dates)
    - [BigInts](#bigints)
    - [Circular References](#circular-references)
    - [Infinity](#infinity)
  - [Summary](#summary)

<!--toc:end-->

## Why Use **Safe-JSON**?

JavaScript's native `JSON.parse` and `JSON.stringify` can throw runtime errors that are not reflected in TypeScript definitions, making them error-prone and unpredictable. These errors often stem from JavaScript quirks and limitations, such as:

- Handling of `null` and `undefined`.
- Special numeric values (`NaN`, `Infinity`).
- Invalid `Date` objects.
- BigInt values.
- Circular references in objects.

**Safe-JSON** eliminates this confusion by offering safe alternatives that never throw. Instead, all methods return a tuple of `[error, result]`, allowing you to handle errors explicitly and gracefully.

______________________________________________________________________

## Features

**Safe-JSON** handles:

- **Null/Undefined:** Normalizes `null` and `undefined` to JSON-compliant `null`.
- **NaN and Infinity:** Converts invalid numeric values to `null`.
- **Invalid Dates:** Represents invalid dates as `null`.
- **BigInts:** Properly serializes and deserializes `BigInt` values.
- **Circular References:** Detects and replaces circular references with descriptive pointers (e.g., `$ref.root.path`).
- **Custom Serialization:** Enables error-free handling of complex or non-standard JavaScript objects.

______________________________________________________________________

## Installation

### npm

```bash
npm install @austinbreslin/safe-json
```

### pnpm

```bash
pnpm add @austinbreslin/safe-json
```

## Usage

```typescript

import { stringify, parse } from "@austinbreslin/safe-json";

const test = {
  bigInt: 1234567890123456789012345678901234567890n,
  circular: { inner: null },
  invalidDate: new Date('invalid-date'),
  nan: NaN,
  undefined: undefined,
  null: null,
  nested: {
    array: [{ test: 'test' }],
    object: {
      innerObject: { innerArray: [{ test: 'test' }] }
    }
  }
};

// Introduce circular reference
test.circular.inner = test.circular;

// Safely stringify
const [strErr, stringified] = stringify(test);
if (strErr) {
  console.error("Stringify error:", strErr);
} else {
  console.log("Stringified JSON:", stringified);
}

/*
{
  "bigInt": "1234567890123456789012345678901234567890",
  "circular": {
    "inner": "$ref.root.circular"
  },
  "invalidDate": null,
  "nan": null,
  "undefined": null,
  "nested": {
    "array": [{ "test": "test" }],
    "object": {
      "innerObject": {
        "innerArray": [{ "test": "test" }]
      }
    }
  }
}
*/

// Safely parse
const [parErr, parsed] = parse(stringified);
if (parErr) {
  console.error("Parse error:", parErr);
} else {
  console.log("Parsed object:", parsed);
}
```

## Notes

### Performance

While **Safe-JSON** is optimized for safety and flexibility, it cannot match the raw speed of native JSON methods due to
additional processing. However, for very large JSON objects, it may perform better in real-world scenarios because it
leverages generators to prevent blocking the event loop.

______________________________________________________________________

If performance is a critical concern, consider using native JSON methods where safety is less of a priority or
exploring alternatives like BSON for more efficient serialization.

### Design Goals

The primary goal of **Safe-JSON** is to eliminate undefined behavior and prevent unexpected runtime errors. It aims to:

______________________________________________________________________

Provide clear and predictable error handling.
Simplify debugging and reduce crashes.
Standardize JSON serialization and deserialization across edge cases.

## Detailed Features

### Normalizing Null/Undefined/NaN/Invalid Dates

JavaScript allows multiple representations of `null` (e.g., `undefined`, `NaN`, invalid `Date` objects).
JSON only supports null. **Safe-JSON** converts these variations to JSON-compliant `null`.

### BigInts

Native JSON does not support JavaScript's `BigInt` type. **Safe-JSON** properly serializes `BigInt` values and restores them
during deserialization.

### Circular References

Circular references cause native `JSON.stringify` to throw an error. **Safe-JSON** detects and replaces circular references with descriptive pointers
(e.g., `$ref.root.path`). This ensures error-free serialization while preserving structure.

### Infinity

JavaScript's `Infinity` constants represent invalid numbers in JSON. **Safe-JSON** replaces these values with `null` during
serialization to maintain JSON compliance.

## Summary

**Safe-JSON** is designed to:

Improve safety and predictability in JSON handling.
Handle JavaScript quirks seamlessly.
Provide a reliable solution for complex data structures.
If your application requires robust error handling and compatibility with non-standard JSON scenarios,
**Safe-JSON** is the perfect tool for the job.
