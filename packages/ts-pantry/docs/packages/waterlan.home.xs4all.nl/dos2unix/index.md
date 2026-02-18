# dos2unix

> Convert text between DOS, UNIX, and Mac formats

## Package Information

- **Domain**: `waterlan.home.xs4all.nl/dos2unix`
- **Name**: `dos2unix`
- **Homepage**: https://waterlan.home.xs4all.nl/dos2unix.html
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/waterlan.home.xs4all.nl/dos2unix/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install waterlan.home.xs4all.nl/dos2unix
```

## Programs

This package provides the following executable programs:

- `dos2unix`
- `mac2unix`
- `unix2dos`
- `unix2mac`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `7.5.4`, `7.5.3`, `7.5.2`

</details>

**Latest Version**: `7.5.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +waterlan.home.xs4all.nl/dos2unix@7.5.4 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnu.org/gettext`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.dos2unix

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/waterlan.home.xs4all.nl/dos2unix/package.yml)
- [Homepage](https://waterlan.home.xs4all.nl/dos2unix.html)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
