# pcre2

> Perl compatible regular expressions library with a new API

## Package Information

- **Domain**: `pcre.org/v2`
- **Name**: `pcre2`
- **Homepage**: <https://www.pcre.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/pcre.org/v2/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install pcre.org/v2
```

## Programs

This package provides the following executable programs:

- `pcre2-config`
- `pcre2grep`
- `pcre2test`

## Available Versions

<details>
<summary>Show all 5 versions</summary>

- `10.47.0`
- `10.46.0`
- `10.44.0`
- `10.43.0`
- `10.42.0`

</details>

**Latest Version**: `10.47.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +pcre.org/v2@10.47.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `sourceware.org/bzip2@1`
- `zlib.net@1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.pcre2

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/pcre.org/v2/package.yml)
- [Homepage](https://www.pcre.org/)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
