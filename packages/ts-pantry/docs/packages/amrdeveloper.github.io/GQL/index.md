# gitql

> GitQL is a extensible SQL-like query language and SDK to perform queries on various data sources such .git files with supports of most of SQL features such as grouping, ordering and aggregation and window functions and allow customization like user-defined types and functions

## Package Information

- **Domain**: `amrdeveloper.github.io/GQL`
- **Name**: `gitql`
- **Homepage**: https://amrdeveloper.github.io/GQL/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/amrdeveloper.github.io/GQL/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install amrdeveloper.github.io/GQL
```

## Programs

This package provides the following executable programs:

- `gitql`

## Available Versions

<details>
<summary>Show all 36 versions</summary>

- `0.42.0`, `0.41.0`, `0.40.0`, `0.39.0`, `0.38.0`
- `0.37.0`, `0.36.0`, `0.35.0`, `0.34.0`, `0.33.0`
- `0.32.0`, `0.31.0`, `0.30.0`, `0.29.1`, `0.28.0`
- `0.27.0`, `0.26.0`, `0.25.0`, `0.24.0`, `0.23.0`
- `0.22.1`, `0.22.0`, `0.21.0`, `0.20.0`, `0.19.1`
- `0.19.0`, `0.18.0`, `0.17.0`, `0.16.0`, `0.15.0`
- `0.14.0`, `0.13.0`, `0.12.0`, `0.11.0`, `0.10.0`
- `0.9.0`

</details>

**Latest Version**: `0.42.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +amrdeveloper.github.io/GQL@0.42.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `libgit2.org~1.7 # links to libgit2.so.1.7`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.gitql

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/amrdeveloper.github.io/GQL/package.yml)
- [Homepage](https://amrdeveloper.github.io/GQL/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
