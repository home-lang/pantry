# wasmer

> 🚀 Fast, secure, lightweight containers based on WebAssembly

## Package Information

- **Domain**: `wasmer.io`
- **Name**: `wasmer`
- **Homepage**: <https://wasmer.io>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/wasmer.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install wasmer.io
```

## Programs

This package provides the following executable programs:

- `wasmer`

## Available Versions

<details>
<summary>Show all 26 versions</summary>

- `7.0.1`, `7.0.0`
- `6.1.0`
- `6.0.1`, `6.0.0`
- `5.0.4`, `5.0.3`, `5.0.2`, `5.0.1`, `5.0.0`
- `4.4.0`
- `4.3.7`, `4.3.6`, `4.3.5`, `4.3.4`, `4.3.3`, `4.3.2`, `4.3.1`, `4.3.0`
- `4.2.8`, `4.2.7`, `4.2.6`, `4.2.5`, `4.2.4`, `4.2.3`, `4.2.2`

</details>

**Latest Version**: `7.0.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +wasmer.io@7.0.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `linux:sourceware.org/libffi`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.wasmer

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/wasmer.io/package.yml)
- [Homepage](https://wasmer.io)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
