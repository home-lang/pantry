# net-tools

> Linux networking base tools

## Package Information

- **Domain**: `sourceforge.net/net-tools`
- **Name**: `net-tools`
- **Homepage**: https://sourceforge.net/projects/net-tools/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/sourceforge.net/net-tools/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install sourceforge.net/net-tools
```

## Programs

This package provides the following executable programs:

- `hostname`
- `ifconfig`
- `netstat`
- `route`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `2.10.0`

</details>

**Latest Version**: `2.10.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +sourceforge.net/net-tools@2.10.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['net-tools']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/sourceforge.net/net-tools/package.yml)
- [Homepage](https://sourceforge.net/projects/net-tools/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
