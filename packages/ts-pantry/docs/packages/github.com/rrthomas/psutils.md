# psutils

> Utilities for manipulating PostScript documents

## Package Information

- **Domain**: `github.com/rrthomas/psutils`
- **Name**: `psutils`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/rrthomas/psutils/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/rrthomas/psutils
```

## Programs

This package provides the following executable programs:

- `psbook`
- `psjoin`
- `psnup`
- `psresize`
- `psselect`
- `pstops`

## Available Versions

<details>
<summary>Show all 20 versions</summary>

- `3.3.14`, `3.3.13`, `3.3.12`, `3.3.11`, `3.3.10`, `3.3.9`, `3.3.8`, `3.3.7`, `3.3.6`, `3.3.5`, `3.3.4`, `3.3.3`, `3.3.2`, `3.3.1`, `3.3.0`
- `3.2.0`
- `3.1.2`, `3.1.1`, `3.1.0`
- `3.0.9`

</details>

**Latest Version**: `3.3.14`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/rrthomas/psutils@3.3.14 -- $SHELL -i
```

## Dependencies

This package depends on:

- `pkgx.sh>=1`
- `github.com/rrthomas/libpaper`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.psutils

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/rrthomas/psutils/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
