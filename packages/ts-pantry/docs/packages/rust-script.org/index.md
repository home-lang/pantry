# rust-script

> Run Rust files and expressions as scripts without any setup or compilation step.

## Package Information

- **Domain**: `rust-script.org`
- **Name**: `rust-script`
- **Homepage**: https://rust-script.org
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/rust-script.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install rust-script.org
```

## Programs

This package provides the following executable programs:

- `rust-script`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `0.36.0`, `0.35.0`, `0.34.0`

</details>

**Latest Version**: `0.36.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +rust-script.org@0.36.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['rust-script']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/rust-script.org/package.yml)
- [Homepage](https://rust-script.org)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
