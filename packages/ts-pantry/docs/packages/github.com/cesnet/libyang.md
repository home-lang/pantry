# libyang

> YANG data modeling language library

## Package Information

- **Domain**: `github.com/cesnet/libyang`
- **Name**: `libyang`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/cesnet/libyang/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/cesnet/libyang
```

## Programs

This package provides the following executable programs:

- `yanglint`
- `yangre`

## Available Versions

<details>
<summary>Show all 8 versions</summary>

- `4.2.2`
- `3.13.6`, `3.13.5`
- `3.12.2`
- `3.7.8`
- `3.4.2`
- `3.1.0`
- `2.1.148`

</details>

**Latest Version**: `4.2.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/cesnet/libyang@4.2.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `pcre.org/v2>=10.21`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.libyang

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/cesnet/libyang/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
