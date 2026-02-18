# pcre

> Perl compatible regular expressions library

## Package Information

- **Domain**: `pcre.org`
- **Name**: `pcre`
- **Homepage**: <https://www.pcre.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/pcre.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install pcre.org
```

## Programs

This package provides the following executable programs:

- `pcre-config`
- `pcregrep`
- `pcretest`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `8.45.0`

</details>

**Latest Version**: `8.45.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +pcre.org@8.45.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `sourceware.org/bzip2@1`
- `zlib.net@1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.pcre

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/pcre.org/package.yml)
- [Homepage](https://www.pcre.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
