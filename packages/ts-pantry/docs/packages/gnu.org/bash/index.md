# bash

> Bourne-Again SHell, a UNIX command interpreter

## Package Information

- **Domain**: `gnu.org/bash`
- **Name**: `bash`
- **Homepage**: https://www.gnu.org/software/bash/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/bash/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnu.org/bash
```

## Programs

This package provides the following executable programs:

- `bash`
- `bashbug`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `5.3.0`, `5.2.37`, `5.2.32`, `5.2.21`, `5.2.15`
- `5.1.16`

</details>

**Latest Version**: `5.3.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gnu.org/bash@5.3.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.bash

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/bash/package.yml)
- [Homepage](https://www.gnu.org/software/bash/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
