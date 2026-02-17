# bats

> Bash Automated Testing System

## Package Information

- **Domain**: `github.com/bats-core/bats-core`
- **Name**: `bats`
- **Homepage**: https://bats-core.readthedocs.io/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/bats-core/bats-core/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/bats-core/bats-core
```

## Programs

This package provides the following executable programs:

- `bats`

## Available Versions

<details>
<summary>Show all 5 versions</summary>

- `1.13.0`
- `1.12.0`
- `1.11.1`, `1.11.0`
- `1.10.0`

</details>

**Latest Version**: `1.13.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/bats-core/bats-core@1.13.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnu.org/coreutils^9.4`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.bats

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/bats-core/bats-core/package.yml)
- [Homepage](https://bats-core.readthedocs.io/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
