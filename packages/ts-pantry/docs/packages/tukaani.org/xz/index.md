# xz

> General-purpose data compression with high compression ratio

## Package Information

- **Domain**: `tukaani.org/xz`
- **Name**: `xz`
- **Homepage**: https://tukaani.org/xz/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/tukaani.org/xz/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install tukaani.org/xz
```

## Programs

This package provides the following executable programs:

- `lzcat`
- `lzcmp`
- `lzdiff`
- `lzegrep`
- `lzfgrep`
- `lzgrep`
- `lzless`
- `lzma`
- `lzmadec`
- `lzmainfo`
- `lzmore`
- `unlzma`
- `unxz`
- `xz`
- `xzcat`
- `xzcmp`
- `xzdec`
- `xzdiff`
- `xzegrep`
- `xzfgrep`
- `xzgrep`
- `xzless`
- `xzmore`

## Available Versions

<details>
<summary>Show all 19 versions</summary>

- `5.8.2`, `5.8.1`, `5.8.0`, `5.6.4`, `5.6.3`
- `5.6.2`, `5.4.7`, `5.4.6`, `5.4.5`, `5.4.4`
- `5.4.3`, `5.4.2`, `5.4.1`, `5.4.0`, `5.2.13`
- `5.2.12`, `5.2.11`, `5.2.10`, `5.2.7`

</details>

**Latest Version**: `5.8.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +tukaani.org/xz@5.8.2 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.xz

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/tukaani.org/xz/package.yml)
- [Homepage](https://tukaani.org/xz/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
