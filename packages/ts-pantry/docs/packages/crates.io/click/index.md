# click

> The "Command Line Interactive Controller for Kubernetes"

## Package Information

- **Domain**: `crates.io/click`
- **Name**: `click`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/click/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install crates.io/click
```

## Programs

This package provides the following executable programs:

- `click`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `0.6.3`, `0.6.2`

</details>

**Latest Version**: `0.6.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crates.io/click@0.6.3 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1.1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.click

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/click/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
