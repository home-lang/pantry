# berkeley-db

> High performance key/value database

## Package Information

- **Domain**: `oracle.com/berkeley-db`
- **Name**: `berkeley-db`
- **Homepage**: https://www.oracle.com/database/technologies/related/berkeleydb.html
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/oracle.com/berkeley-db/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install oracle.com/berkeley-db
```

## Programs

This package provides the following executable programs:

- `db_verify`
- `db_upgrade`
- `db_tuner`
- `db_replicate`
- `db_stat`
- `db_recover`
- `db_load`
- `db_log_verify`
- `db_printlog`
- `db_dump`
- `db_hotbackup`
- `db_deadlock`
- `db_checkpoint`
- `db_convert`
- `db_archive`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `18.1.40`

</details>

**Latest Version**: `18.1.40`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +oracle.com/berkeley-db@18.1.40 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1.1.1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['berkeley-db']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/oracle.com/berkeley-db/package.yml)
- [Homepage](https://www.oracle.com/database/technologies/related/berkeleydb.html)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
