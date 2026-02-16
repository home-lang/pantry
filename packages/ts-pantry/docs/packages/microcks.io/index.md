# microcks-cli

> Simple CLI for interacting with Microcks test APIs

## Package Information

- **Domain**: `microcks.io`
- **Name**: `microcks-cli`
- **Homepage**: <https://microcks.io>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/microcks.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install microcks.io
```

## Programs

This package provides the following executable programs:

- `microcks-cli`

## Available Versions

<details>
<summary>Show all 9 versions</summary>

- `1.0.2`, `1.0.1`, `1.0.0`, `0.9.0`, `0.5.8`
- `0.5.7`, `0.5.6`, `0.5.5`, `0.5.4`

</details>

**Latest Version**: `1.0.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +microcks.io@1.0.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `curl.se/ca-certs`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['microcks-cli']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/microcks.io/package.yml)
- [Homepage](https://microcks.io)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
