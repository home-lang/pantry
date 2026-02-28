# gci

> GCI, a tool that control golang package import order and make it always deterministic.

## Package Information

- **Domain**: `github.com/daixiang0/gci`
- **Name**: `gci`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/daixiang0/gci/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/daixiang0/gci
```

## Programs

This package provides the following executable programs:

- `gci`

## Available Versions

<details>
<summary>Show all 15 versions</summary>

- `0.14.0`
- `0.13.7`, `0.13.6`, `0.13.5`, `0.13.4`, `0.13.3`, `0.13.2`, `0.13.1`, `0.13.0`
- `0.12.3`, `0.12.2`, `0.12.1`, `0.12.0`
- `0.11.2`, `0.11.1`

</details>

**Latest Version**: `0.14.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/daixiang0/gci@0.14.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.gci

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/daixiang0/gci/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
