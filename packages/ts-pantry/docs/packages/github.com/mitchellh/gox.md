# gox

> A dead simple, no frills Go cross compile tool

## Package Information

- **Domain**: `github.com/mitchellh/gox`
- **Name**: `gox`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/mitchellh/gox/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/mitchellh/gox
```

## Programs

This package provides the following executable programs:

- `gox`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.0.1`

</details>

**Latest Version**: `1.0.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/mitchellh/gox@1.0.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `go.dev`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.gox

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/mitchellh/gox/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
