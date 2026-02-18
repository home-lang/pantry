# checkexec

> CLI tool to conditionally execute commands only when files in a dependency list have been updated. Like `make`, but standalone.

## Package Information

- **Domain**: `crates.io/checkexec`
- **Name**: `checkexec`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/checkexec/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install crates.io/checkexec
```

## Programs

This package provides the following executable programs:

- `checkexec`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `0.2.0`

</details>

**Latest Version**: `0.2.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crates.io/checkexec@0.2.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.checkexec

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/checkexec/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
