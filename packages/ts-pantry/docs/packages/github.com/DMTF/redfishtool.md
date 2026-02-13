# redfishtool

> A Python34 program that implements a command line tool for accessing the Redfish API.

## Package Information

- **Domain**: `github.com/DMTF/redfishtool`
- **Name**: `redfishtool`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/DMTF/redfishtool/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/DMTF/redfishtool
```

## Programs

This package provides the following executable programs:

- `redfishtool`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.1.8`

</details>

**Latest Version**: `1.1.8`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/DMTF/redfishtool@1.1.8 -- $SHELL -i
```

## Dependencies

This package depends on:

- `pkgx.sh^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.redfishtool

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/DMTF/redfishtool/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
