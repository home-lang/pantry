# tfenv

> Terraform version manager

## Package Information

- **Domain**: `github.com/tfutils/tfenv`
- **Name**: `tfenv`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/tfutils/tfenv/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/tfutils/tfenv
```

## Programs

This package provides the following executable programs:

- `tfenv`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `3.0.0`

</details>

**Latest Version**: `3.0.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/tfutils/tfenv@3.0.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnu.org/grep`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.tfenv

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/tfutils/tfenv/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
