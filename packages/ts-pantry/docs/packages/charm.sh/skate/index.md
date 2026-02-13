# skate

> A personal key value store 🛼

## Package Information

- **Domain**: `charm.sh/skate`
- **Name**: `skate`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/charm.sh/skate/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install charm.sh/skate
```

## Programs

This package provides the following executable programs:

- `skate`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `1.0.1`, `1.0.0`, `0.2.2`

</details>

**Latest Version**: `1.0.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +charm.sh/skate@1.0.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `curl.se/ca-certs`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.skate

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/charm.sh/skate/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
