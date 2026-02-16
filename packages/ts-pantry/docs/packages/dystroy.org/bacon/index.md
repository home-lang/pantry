# bacon

> Background rust code check

## Package Information

- **Domain**: `dystroy.org/bacon`
- **Name**: `bacon`
- **Homepage**: https://dystroy.org/bacon/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/dystroy.org/bacon/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install dystroy.org/bacon
```

## Programs

This package provides the following executable programs:

- `bacon`

## Available Versions

<details>
<summary>Show all 18 versions</summary>

- `3.22.0`, `3.21.0`, `3.20.3`, `3.20.2`, `3.20.1`
- `3.19.0`, `3.18.0`, `3.17.0`, `3.16.0`, `3.15.0`
- `3.14.0`, `3.13.0`, `3.12.0`, `3.11.0`, `3.10.0`
- `3.9.1`, `3.9.0`, `3.8.0`

</details>

**Latest Version**: `3.22.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +dystroy.org/bacon@3.22.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `linux:alsa-project.org/alsa-lib`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.bacon

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/dystroy.org/bacon/package.yml)
- [Homepage](https://dystroy.org/bacon/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
