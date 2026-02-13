# getfoundry.sh

> Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.

## Package Information

- **Domain**: `getfoundry.sh`
- **Name**: `getfoundry.sh`
- **Homepage**: https://getfoundry.sh
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/getfoundry.sh/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install getfoundry.sh
```

## Programs

This package provides the following executable programs:

- `forge`
- `anvil`
- `cast`
- `chisel`

## Available Versions

<details>
<summary>Show all 23 versions</summary>

- `2024.4.12`, `2023.12.7`, `2023.7.16`, `1.5.1`, `1.5.0`
- `1.4.4`, `1.4.3`, `1.4.2`, `1.4.1`, `1.4.0`
- `1.3.6`, `1.3.5`, `1.3.4`, `1.3.3`, `1.3.1`
- `1.3.0`, `1.2.3`, `1.2.2`, `1.2.1`, `1.2.0`
- `1.1.0`, `1.0.0`, `0.3.0`

</details>

**Latest Version**: `2024.4.12`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +getfoundry.sh@2024.4.12 -- $SHELL -i
```

## Dependencies

This package depends on:

- `git-scm.org^2`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['getfoundry.sh']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/getfoundry.sh/package.yml)
- [Homepage](https://getfoundry.sh)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
