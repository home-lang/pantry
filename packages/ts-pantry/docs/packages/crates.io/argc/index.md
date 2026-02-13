# argc

> A Bash CLI framework, also a Bash command runner.

## Package Information

- **Domain**: `crates.io/argc`
- **Name**: `argc`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/argc/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install crates.io/argc
```

## Programs

This package provides the following executable programs:

- `argc`

## Available Versions

<details>
<summary>Show all 11 versions</summary>

- `1.23.0`, `1.22.0`, `1.21.1`, `1.21.0`, `1.20.1`
- `1.20.0`, `1.19.0`, `1.18.0`, `1.17.0`, `1.16.0`
- `1.15.0`

</details>

**Latest Version**: `1.23.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crates.io/argc@1.23.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.argc

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/argc/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
