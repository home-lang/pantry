# protoc

> Protocol Buffers implementation in C

## Package Information

- **Domain**: `github.com/protobuf-c/protobuf-c`
- **Name**: `protoc`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/protobuf-c/protobuf-c/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/protobuf-c/protobuf-c
```

## Programs

This package provides the following executable programs:

- `protoc-c`
- `protoc-gen-c`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `1.5.2`, `1.5.1`, `1.5.0`

</details>

**Latest Version**: `1.5.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/protobuf-c/protobuf-c@1.5.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `protobuf.dev^25.1`
- `abseil.io^20250127`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.protoc

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/protobuf-c/protobuf-c/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
