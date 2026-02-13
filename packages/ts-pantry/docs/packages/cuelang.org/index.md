# cue

> The home of the CUE language! Validate and define text-based and dynamic configuration

## Package Information

- **Domain**: `cuelang.org`
- **Name**: `cue`
- **Homepage**: https://cuelang.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/cuelang.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install cuelang.org
```

## Programs

This package provides the following executable programs:

- `cue`

## Available Versions

<details>
<summary>Show all 28 versions</summary>

- `0.15.3`, `0.15.2`, `0.15.1`, `0.15.0`, `0.14.2`
- `0.14.1`, `0.14.0`, `0.13.2`, `0.13.1`, `0.13.0`
- `0.12.1`, `0.12.0`, `0.11.2`, `0.11.1`, `0.11.0`
- `0.10.1`, `0.10.0`, `0.9.2`, `0.9.1`, `0.9.0`
- `0.8.2`, `0.8.1`, `0.8.0`, `0.7.1`, `0.7.0`
- `0.6.0`, `0.5.0`, `0.4.3`

</details>

**Latest Version**: `0.15.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +cuelang.org@0.15.3 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.cue

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/cuelang.org/package.yml)
- [Homepage](https://cuelang.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
