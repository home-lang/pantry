# gomplate

> A flexible commandline tool for template rendering. Supports lots of local and remote datasources.

## Package Information

- **Domain**: `gomplate.ca`
- **Name**: `gomplate`
- **Homepage**: https://gomplate.ca/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gomplate.ca/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gomplate.ca
```

## Programs

This package provides the following executable programs:

- `gomplate`

## Available Versions

<details>
<summary>Show all 13 versions</summary>

- `5.0.0`, `4.3.3`, `4.3.2`, `4.3.1`, `4.3.0`
- `4.2.0`, `4.1.0`, `4.0.1`, `4.0.0`, `3.11.8`
- `3.11.7`, `3.11.6`, `3.11.4`

</details>

**Latest Version**: `5.0.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gomplate.ca@5.0.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.gomplate

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gomplate.ca/package.yml)
- [Homepage](https://gomplate.ca/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
