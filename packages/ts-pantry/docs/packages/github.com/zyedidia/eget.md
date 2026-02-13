# Eget

> Easily install prebuilt binaries from GitHub.

## Package Information

- **Domain**: `github.com/zyedidia/eget`
- **Name**: `Eget`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/zyedidia/eget/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/zyedidia/eget
```

## Programs

This package provides the following executable programs:

- `eget`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `1.3.4`, `1.3.3`

</details>

**Latest Version**: `1.3.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/zyedidia/eget@1.3.4 -- $SHELL -i
```

## Dependencies

This package depends on:

- `curl.se/ca-certs`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.Eget

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/zyedidia/eget/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
