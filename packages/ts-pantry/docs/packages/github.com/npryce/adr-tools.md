# adr

> Command-line tools for working with Architecture Decision Records

## Package Information

- **Domain**: `github.com/npryce/adr-tools`
- **Name**: `adr`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/npryce/adr-tools/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/npryce/adr-tools
```

## Programs

This package provides the following executable programs:

- `adr`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `3.0.0`

</details>

**Latest Version**: `3.0.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/npryce/adr-tools@3.0.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnu.org/bash`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.adr

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/npryce/adr-tools/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
