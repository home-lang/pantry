# strace

> strace is a diagnostic, debugging and instructional userspace utility for Linux

## Package Information

- **Domain**: `strace.io`
- **Name**: `strace`
- **Homepage**: <https://strace.io/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/strace.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install strace.io
```

## Programs

This package provides the following executable programs:

- `strace`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `6.2.0`

</details>

**Latest Version**: `6.2.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +strace.io@6.2.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.strace

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/strace.io/package.yml)
- [Homepage](https://strace.io/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
