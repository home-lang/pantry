# putty

> Implementation of Telnet and SSH

## Package Information

- **Domain**: `chiark.greenend.org.uk/putty`
- **Name**: `putty`
- **Homepage**: https://www.chiark.greenend.org.uk/~sgtatham/putty/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/chiark.greenend.org.uk/putty/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install chiark.greenend.org.uk/putty
```

## Programs

This package provides the following executable programs:

- `pageant`
- `plink`
- `pscp`
- `psftp`
- `psusan`
- `puttygen`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `0.83.0`, `0.82.0`, `0.81.0`, `0.80.0`, `0.79.0`
- `0.78.0`

</details>

**Latest Version**: `0.83.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +chiark.greenend.org.uk/putty@0.83.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.putty

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/chiark.greenend.org.uk/putty/package.yml)
- [Homepage](https://www.chiark.greenend.org.uk/~sgtatham/putty/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
