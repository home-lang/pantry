# unxip

> A fast Xcode unarchiver

## Package Information

- **Domain**: `github.com/saagarjha/unxip`
- **Name**: `unxip`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/saagarjha/unxip/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/saagarjha/unxip
```

## Programs

This package provides the following executable programs:

- `unxip`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `3.3.0`, `3.2.0`, `3.1.0`, `3.0.0`, `2.2.0`
- `2.1.0`

</details>

**Latest Version**: `3.3.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/saagarjha/unxip@3.3.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.unxip

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/saagarjha/unxip/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
