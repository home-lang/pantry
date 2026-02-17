# kaspa

> Kaspa full-node reference implementation and related libraries in the Rust programming language

## Package Information

- **Domain**: `github.com/kaspanet/rusty-kaspa`
- **Name**: `kaspa`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/kaspanet/rusty-kaspa/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/kaspanet/rusty-kaspa
```

## Programs

This package provides the following executable programs:

- `kaspad`
- `kaspa-cli`

## Available Versions

<details>
<summary>Show all 16 versions</summary>

- `1.0.1`, `1.0.0`
- `0.17.2`, `0.17.1`, `0.17.0`
- `0.16.1`, `0.16.0`
- `0.15.2`, `0.15.1`
- `0.14.1`
- `0.13.6`, `0.13.4`, `0.13.3`, `0.13.2`, `0.13.0`
- `0.1.7`

</details>

**Latest Version**: `1.0.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/kaspanet/rusty-kaspa@1.0.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `linux:openssl.org^1.1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.kaspa

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/kaspanet/rusty-kaspa/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
