# mergestat

> Query git repositories with SQL. Generate reports, perform status checks, analyze codebases. 🔍 📊

## Package Information

- **Domain**: `mergestat.com/mergestat-lite`
- **Name**: `mergestat`
- **Homepage**: <https://mergestat.com/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/mergestat.com/mergestat-lite/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install mergestat.com/mergestat-lite
```

## Programs

This package provides the following executable programs:

- `mergestat`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `0.6.2`, `0.6.1`

</details>

**Latest Version**: `0.6.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +mergestat.com/mergestat-lite@0.6.2 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.mergestat

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/mergestat.com/mergestat-lite/package.yml)
- [Homepage](https://mergestat.com/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
