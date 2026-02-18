# smartmontools

> SMART hard drive monitoring

## Package Information

- **Domain**: `smartmontools.org`
- **Name**: `smartmontools`
- **Homepage**: <https://www.smartmontools.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/smartmontools.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install smartmontools.org
```

## Programs

This package provides the following executable programs:

- `smartctl`
- `smartd`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `7.5.0`
- `7.4.0`
- `7.3.0`

</details>

**Latest Version**: `7.5.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +smartmontools.org@7.5.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.smartmontools

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/smartmontools.org/package.yml)
- [Homepage](https://www.smartmontools.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
