# littlecms

> A free, open source, CMM engine. It provides fast transforms between ICC profiles.

## Package Information

- **Domain**: `littlecms.com`
- **Name**: `littlecms`
- **Homepage**: https://www.littlecms.com/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/littlecms.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install littlecms.com
```

## Programs

This package provides the following executable programs:

- `jpgicc`
- `linkicc`
- `psicc`
- `tificc`
- `transicc`

## Available Versions

<details>
<summary>Show all 5 versions</summary>

- `2.18.0`, `2.17.0`, `2.16.0`, `2.15.0`, `2.12.0`

</details>

**Latest Version**: `2.18.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +littlecms.com@2.18.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `simplesystems.org/libtiff^4`
- `libjpeg-turbo.org^2`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.littlecms

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/littlecms.com/package.yml)
- [Homepage](https://www.littlecms.com/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
