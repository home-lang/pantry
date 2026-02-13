# Protocol Buffers

> Protocol Buffers - Google's data interchange format

## Package Information

- **Domain**: `protobuf.dev`
- **Name**: `Protocol Buffers`
- **Homepage**: https://protobuf.dev/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/protobuf.dev/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install protobuf.dev
```

## Programs

This package provides the following executable programs:

- `protoc`

## Available Versions

<details>
<summary>Show all 50 versions</summary>

- `33.4.0`, `33.3.0`, `33.2.0`, `33.1.0`, `33.0.0`
- `32.1.0`, `32.0.0`, `31.1.0`, `31.0.0`, `30.2.0`
- `30.1.0`, `30.0.0`, `29.5.0`, `29.4.0`, `29.3.0`
- `29.2.0`, `29.1.0`, `29.0.0`, `28.3.0`, `28.2.0`
- `28.1.0`, `28.0.0`, `27.5.0`, `27.4.0`, `27.3.0`
- `27.2.0`, `27.1.0`, `27.0.0`, `26.1.0`, `26.0.0`
- `25.8.0`, `25.7.0`, `25.6.0`, `25.5.0`, `25.4.0`
- `25.3.0`, `25.2.0`, `25.1.0`, `25.0.0`, `24.4.0`
- `24.3.0`, `24.2.0`, `24.1.0`, `23.4.0`, `23.3.0`
- `23.2.0`, `23.1.0`, `23.0.0`, `22.5.0`, `21.12.0`

</details>

**Latest Version**: `33.4.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +protobuf.dev@33.4.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `zlib.net^1`
- `abseil.io`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['Protocol Buffers']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/protobuf.dev/package.yml)
- [Homepage](https://protobuf.dev/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
