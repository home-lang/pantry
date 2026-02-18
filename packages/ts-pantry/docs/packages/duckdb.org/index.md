# duckdb

> DuckDB is an analytical in-process SQL database management system

## Package Information

- **Domain**: `duckdb.org`
- **Name**: `duckdb`
- **Homepage**: <https://www.duckdb.org>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/duckdb.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install duckdb.org
```

## Programs

This package provides the following executable programs:

- `duckdb`

## Available Versions

<details>
<summary>Show all 26 versions</summary>

- `1.4.4`, `1.4.3`, `1.4.2`, `1.4.1`, `1.4.0`
- `1.3.2`, `1.3.1`, `1.3.0`
- `1.2.2`, `1.2.1`, `1.2.0`
- `1.1.3`, `1.1.2`, `1.1.1`, `1.1.0`
- `1.0.0`
- `0.10.3`, `0.10.2`, `0.10.1`, `0.10.0`
- `0.9.2`, `0.9.1`, `0.9.0`
- `0.8.1`, `0.8.0`
- `0.7.1`

</details>

**Latest Version**: `1.4.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +duckdb.org@1.4.4 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.duckdb

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/duckdb.org/package.yml)
- [Homepage](https://www.duckdb.org)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
