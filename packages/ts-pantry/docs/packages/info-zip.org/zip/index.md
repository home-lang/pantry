# zip

> Compression and file packaging/archive utility

## Package Information

- **Domain**: `info-zip.org/zip`
- **Name**: `zip`
- **Homepage**: <https://infozip.sourceforge.net/Zip.html>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/info-zip.org/zip/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install info-zip.org/zip
```

## Programs

This package provides the following executable programs:

- `zip`
- `zipcloak`
- `zipnote`
- `zipsplit`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `3.0.0`

</details>

**Latest Version**: `3.0.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +info-zip.org/zip@3.0.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `sourceware.org/bzip2`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.zip

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/info-zip.org/zip/package.yml)
- [Homepage](https://infozip.sourceforge.net/Zip.html)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
