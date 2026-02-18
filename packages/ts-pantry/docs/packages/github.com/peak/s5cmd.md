# s5cmd

> Parallel S3 and local filesystem execution tool.

## Package Information

- **Domain**: `github.com/peak/s5cmd`
- **Name**: `s5cmd`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/peak/s5cmd/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/peak/s5cmd
```

## Programs

This package provides the following executable programs:

- `s5cmd`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `2.3.0`

</details>

**Latest Version**: `2.3.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/peak/s5cmd@2.3.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.s5cmd

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/peak/s5cmd/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
