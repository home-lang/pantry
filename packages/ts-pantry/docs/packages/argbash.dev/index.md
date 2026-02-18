# argbash

> Bash argument parsing code generator

## Package Information

- **Domain**: `argbash.dev`
- **Name**: `argbash`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/argbash.dev/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install argbash.dev
```

## Programs

This package provides the following executable programs:

- `argbash`
- `argbash-init`
- `argbash-1to2`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `2.11.0`
- `2.10.0`

</details>

**Latest Version**: `2.11.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +argbash.dev@2.11.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnu.org/bash>=3`
- `gnu.org/autoconf`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.argbash

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/argbash.dev/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
