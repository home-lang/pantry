# bzip2

> Clone of https://gitlab.com/federicomenaquintero/bzip2

## Package Information

- **Domain**: `sourceware.org/bzip2`
- **Name**: `bzip2`
- **Homepage**: https://sourceware.org/bzip2/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/sourceware.org/bzip2/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install sourceware.org/bzip2
```

## Programs

This package provides the following executable programs:

- `bunzip2`
- `bzcat`
- `bzcmp`
- `bzdiff`
- `bzgrep`
- `bzegrep`
- `bzfgrep`
- `bzip2`
- `bzip2recover`
- `bzmore`
- `bzless`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.0.8`

</details>

**Latest Version**: `1.0.8`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +sourceware.org/bzip2@1.0.8 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.bzip2

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/sourceware.org/bzip2/package.yml)
- [Homepage](https://sourceware.org/bzip2/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
