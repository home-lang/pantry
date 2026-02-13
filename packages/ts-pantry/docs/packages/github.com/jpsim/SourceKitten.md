# sourcekitten

> An adorable little framework and command line tool for interacting with SourceKit.

## Package Information

- **Domain**: `github.com/jpsim/SourceKitten`
- **Name**: `sourcekitten`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/jpsim/SourceKitten/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/jpsim/SourceKitten
```

## Programs

This package provides the following executable programs:

- `sourcekitten`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `0.37.2`, `0.37.1`, `0.37.0`, `0.36.0`, `0.35.0`
- `0.34.1`

</details>

**Latest Version**: `0.37.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/jpsim/SourceKitten@0.37.2 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.sourcekitten

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/jpsim/SourceKitten/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
