# OpenAPI generator miragejs typescript

## Usage

With Node 16.17+

```
npx openapi-generator-miragejs -i PATH_TO_INPUT_SPEC -o OUTPUT_DIR
```

will generate mirage server config inside OUTPUT_DIR, creating the directory if it doesn't already exist.

ensure you have miragejs installed in the target project

```
npm install miragejs
```

## Example values

The more detail you provide in your input documents, the more realistic your output will be. Generate looks for `example` values and tries to respect `min` and `max` fields where provided.

## Contribution

This project was created with bun

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.js
```
