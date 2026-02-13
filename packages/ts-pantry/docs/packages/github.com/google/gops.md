# gops

> A tool to list and diagnose Go processes currently running on your system

## Package Information

- **Domain**: `github.com/google/gops`
- **Name**: `gops`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/google/gops/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/google/gops
```

## Programs

This package provides the following executable programs:

- `gops`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `0.3.29`, `0.3.28`, `0.3.27`

</details>

**Latest Version**: `0.3.29`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/google/gops@0.3.29 -- $SHELL -i
```

## Dependencies

This package depends on:

- `go.dev`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.gops

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/google/gops/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
