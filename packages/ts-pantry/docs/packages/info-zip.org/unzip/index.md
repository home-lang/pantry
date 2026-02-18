# unzip

> Extraction utility for .zip compressed archives

## Package Information

- **Domain**: `info-zip.org/unzip`
- **Name**: `unzip`
- **Homepage**: <https://infozip.sourceforge.net/UnZip.html>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/info-zip.org/unzip/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install info-zip.org/unzip
```

## Programs

This package provides the following executable programs:

- `funzip`
- `unzip`
- `unzipsfx`
- `zipgrep`
- `zipinfo`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `6.0.0`

</details>

**Latest Version**: `6.0.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +info-zip.org/unzip@6.0.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.unzip

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/info-zip.org/unzip/package.yml)
- [Homepage](https://infozip.sourceforge.net/UnZip.html)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
