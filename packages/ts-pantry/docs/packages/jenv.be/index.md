# jenv

> Manage your Java environment

## Package Information

- **Domain**: `jenv.be`
- **Name**: `jenv`
- **Homepage**: http://www.jenv.be
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/jenv.be/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install jenv.be
```

## Programs

This package provides the following executable programs:

- `jenv`

## Available Versions

<details>
<summary>Show all 5 versions</summary>

- `0.6.0`
- `0.5.9`, `0.5.8`, `0.5.7`, `0.5.6`

</details>

**Latest Version**: `0.6.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +jenv.be@0.6.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.jenv

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/jenv.be/package.yml)
- [Homepage](http://www.jenv.be)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
