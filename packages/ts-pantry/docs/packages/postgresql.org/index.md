# postgresql

> Mirror of the official PostgreSQL GIT repository. Note that this is just a *mirror* - we don't work with pull requests on github. To contribute, please see <https://wiki.postgresql.org/wiki/Submitting_a_Patch>

## Package Information

- **Domain**: `postgresql.org`
- **Name**: `postgresql`
- **Homepage**: <https://www.postgresql.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/postgresql.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install postgresql.org
```

## Programs

This package provides the following executable programs:

- `clusterdb`
- `createdb`
- `dropdb`
- `dropuser`
- `ecpg`
- `initdb`
- `pg_archivecleanup`
- `pg_basebackup`
- `pg_config`
- `pg_controldata`
- `pg_ctl`
- `pg_dump`
- `pg_dumpall`
- `pg_isready`
- `pg_receivewal`
- `pg_recvlogical`
- `pg_resetwal`
- `pg_restore`
- `pg_rewind`
- `pg_test_fsync`
- `pg_test_timing`
- `pg_upgrade`
- `pg_waldump`
- `pgbench`
- `postgres`
- `psql`
- `reindexdb`
- `vacuumdb`

## Available Versions

<details>
<summary>Show all 13 versions</summary>

- `18.0.0`
- `17.2.0`
- `17.0.0`
- `16.1.0`
- `16.0.0`
- `15.2.0`
- `14.7.0`
- `13.12.0`
- `13.11.0`
- `13.9.0`
- `13.1.0`
- `12.14.0`
- `11.19.0`

</details>

**Latest Version**: `18.0.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +postgresql.org@18.0.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1.0.1`
- `gnu.org/readline`
- `zlib.net`
- `lz4.org`
- `gnome.org/libxml2~2.13 # abi changed in 2.14`
- `gnome.org/libxslt`
- `unicode.org^73`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.postgresql

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/postgresql.org/package.yml)
- [Homepage](https://www.postgresql.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
