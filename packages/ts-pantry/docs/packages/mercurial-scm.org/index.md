# mercurial-scm

> Scalable distributed version control system

## Package Information

- **Domain**: `mercurial-scm.org`
- **Name**: `mercurial-scm`
- **Homepage**: <https://mercurial-scm.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/mercurial-scm.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install mercurial-scm.org
```

## Programs

This package provides the following executable programs:

- `hg`
- `chg`

## Available Versions

<details>
<summary>Show all 29 versions</summary>

- `7.2.0`, `7.1.2`, `7.1.1`, `7.1.0`, `7.0.3`
- `7.0.2`, `7.0.1`, `7.0.0`, `6.9.5`, `6.9.4`
- `6.9.3`, `6.9.2`, `6.9.1`, `6.9.0`, `6.8.2`
- `6.8.1`, `6.8.0`, `6.7.4`, `6.7.3`, `6.7.2`
- `6.7.1`, `6.7.0`, `6.6.3`, `6.6.2`, `6.6.1`
- `6.6.0`, `6.5.3`, `6.5.2`, `6.5.0`

</details>

**Latest Version**: `7.2.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +mercurial-scm.org@7.2.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org~3.13 # as of 7.1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['mercurial-scm']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/mercurial-scm.org/package.yml)
- [Homepage](https://mercurial-scm.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
