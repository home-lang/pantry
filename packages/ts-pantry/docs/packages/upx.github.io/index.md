# upx

> UPX - the Ultimate Packer for eXecutables

## Package Information

- **Domain**: `upx.github.io`
- **Name**: `upx`
- **Homepage**: https://upx.github.io/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/upx.github.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install upx.github.io
```

## Programs

This package provides the following executable programs:

- `upx`

## Available Versions

<details>
<summary>Show all 5 versions</summary>

- `5.1.0`, `5.0.2`, `5.0.1`, `5.0.0`, `4.2.4`

</details>

**Latest Version**: `5.1.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +upx.github.io@5.1.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `zlib.net`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.upx

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/upx.github.io/package.yml)
- [Homepage](https://upx.github.io/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
