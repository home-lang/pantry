# nspr-config

> Platform-neutral API for system-level and libc-like functions

## Package Information

- **Domain**: `mozilla.org/nspr`
- **Name**: `nspr-config`
- **Homepage**: https://hg.mozilla.org/projects/nspr
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/mozilla.org/nspr/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install mozilla.org/nspr
```

## Programs

This package provides the following executable programs:

- `nspr-config`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `4.38.1`
- `4.36.2`, `4.36.1`
- `4.34.1`

</details>

**Latest Version**: `4.38.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +mozilla.org/nspr@4.38.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['nspr-config']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/mozilla.org/nspr/package.yml)
- [Homepage](https://hg.mozilla.org/projects/nspr)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
