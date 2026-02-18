# tart

> macOS and Linux VMs on Apple Silicon to use in CI and other automations

## Package Information

- **Domain**: `tart.run`
- **Name**: `tart`
- **Homepage**: https://tart.run
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/tart.run/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install tart.run
```

## Programs

This package provides the following executable programs:

- `tart`

## Available Versions

<details>
<summary>Show all 69 versions</summary>

- `2.30.6`, `2.30.5`, `2.30.4`, `2.30.3`, `2.30.1`, `2.30.0`
- `2.29.0`
- `2.28.6`, `2.28.5`, `2.28.4`, `2.28.3`, `2.28.2`, `2.28.1`, `2.28.0`
- `2.27.3`, `2.27.2`, `2.27.1`, `2.27.0`
- `2.26.1`, `2.26.0`
- `2.25.0`
- `2.24.1`, `2.24.0`
- `2.23.0`
- `2.22.4`, `2.22.3`, `2.22.2`, `2.22.0`
- `2.21.0`
- `2.20.2`, `2.20.1`, `2.20.0`
- `2.19.3`, `2.19.2`, `2.19.1`, `2.19.0`
- `2.18.5`, `2.18.4`, `2.18.3`, `2.18.2`, `2.18.1`, `2.18.0`
- `2.17.0`
- `2.16.0`
- `2.15.0`
- `2.14.0`
- `2.13.0`
- `2.12.0`
- `2.11.1`, `2.11.0`
- `2.10.0`
- `2.9.1`, `2.9.0`
- `2.8.1`, `2.8.0`
- `2.7.2`, `2.7.1`, `2.7.0`
- `2.6.1`, `2.6.0`
- `2.4.4`, `2.4.3`, `2.4.2`, `2.4.1`, `2.4.0`
- `2.3.0`
- `2.2.1`, `2.2.0`
- `0.38.0`

</details>

**Latest Version**: `2.30.6`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +tart.run@2.30.6 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.tart

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/tart.run/package.yml)
- [Homepage](https://tart.run)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
