# taplo

> A TOML toolkit written in Rust

## Package Information

- **Domain**: `taplo.tamasfe.dev`
- **Name**: `taplo`
- **Homepage**: <https://taplo.tamasfe.dev>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/taplo.tamasfe.dev/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install taplo.tamasfe.dev
```

## Programs

This package provides the following executable programs:

- `taplo`

## Available Versions

<details>
<summary>Show all 5 versions</summary>

- `0.10.0`, `0.9.3`, `0.9.2`, `0.8.1`, `0.7.2`

</details>

**Latest Version**: `0.10.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +taplo.tamasfe.dev@0.10.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.taplo

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/taplo.tamasfe.dev/package.yml)
- [Homepage](https://taplo.tamasfe.dev)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
