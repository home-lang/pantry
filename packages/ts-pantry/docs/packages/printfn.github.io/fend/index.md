# fend

> Arbitrary-precision unit-aware calculator

## Package Information

- **Domain**: `printfn.github.io/fend`
- **Name**: `fend`
- **Homepage**: <https://printfn.github.io/fend>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/printfn.github.io/fend/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install printfn.github.io/fend
```

## Programs

This package provides the following executable programs:

- `fend`

## Available Versions

<details>
<summary>Show all 20 versions</summary>

- `1.5.8`, `1.5.7`, `1.5.6`, `1.5.5`, `1.5.3`, `1.5.2`, `1.5.1`, `1.5.0`
- `1.4.9`, `1.4.8`, `1.4.7`, `1.4.6`, `1.4.5`, `1.4.4`, `1.4.3`, `1.4.2`, `1.4.1`, `1.4.0`
- `1.3.3`, `1.3.2`

</details>

**Latest Version**: `1.5.8`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +printfn.github.io/fend@1.5.8 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1.1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.fend

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/printfn.github.io/fend/package.yml)
- [Homepage](https://printfn.github.io/fend)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
