# FileTypes

FileTypes is a Node.js package that provides an extensive list of file types and their corresponding MIME types.
It aims to help developers quickly find and identify file extensions and associated media types.

## Install

### npm

```sh
npm install --save @austinbreslin/file-types
```

### pnpm

```sh
pnpm install @austinbreslin/file-types
```

## Usage

FileTypes is compatible with TypeScript, providing full type definitions for enhanced code completion and reliability.

### Module (TypeScript)

```typescript
import { FileTypes } from '@austinbreslin/file-types';

console.log(JSON.stringify(FileTypes, null, 4));
/*
[
  {
    "fileClass": "Multimedia",
    "fileExtensions": ["AVIF"],
    "headerHex": [0, 0, 0],
    "mimeTypes": ["image/avif"],
    "headerOffset": 0
  },
  ...
]
*/
```

### CommonJS

```javascript
const { FileTypes } = require('@austinbreslin/file-types');
```

## Notes

- The file extensions and MIME types arrays are of equal length.
- Trailer Hex and Header Hex are represented as hexadecimal numbers.

## Example Object

```json
{
    "fileClass": "Multimedia",
    "fileExtensions": ["MP4"],
    "headerHex": [0, 0, 0, 20, 102, 116, 121, 112, 105, 115, 111, 109],
    "mimeTypes": ["video/mp4"],
    "headerOffset": 0
}
```

## How It Works

FileTypes is generated using data from two primary sources: the `mime` package and the online library by Gary Kessler.
This combination allows for a comprehensive database of file signatures and types.

## Package Size

The compiled JavaScript bundle size for FileTypes is approximately 75KB, making it lightweight yet informative
for developers working on various projects.

## Contribution

Contributions to FileTypes are welcome! If you notice any errors or omissions in the file type definitions, please submit an issue or pull request. Contributions should follow the Node.js Code Conventions.

## License

FileTypes is distributed under the [MIT License](LICENSE).

## Credit to
[mime](https://github.com/broofa/mime)
[FileSigs](https://www.garykessler.net/library/file_sigs.html)

