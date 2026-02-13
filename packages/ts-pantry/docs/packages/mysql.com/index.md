# mysql

> MySQL Server, the world's most popular open source database, and MySQL Cluster, a real-time, open source transactional database.

## Package Information

- **Domain**: `mysql.com`
- **Name**: `mysql`
- **Homepage**: http://www.mysql.com/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/mysql.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install mysql.com
```

## Programs

This package provides the following executable programs:

- `mysql_client_test`
- `my_print_defaults`
- `myisam_ftdump`
- `myisamchk`
- `myisamlog`
- `myisampack`
- `mysql`
- `mysql_config`
- `mysql_config_editor`
- `mysql_keyring_encryption_test`
- `mysql_migrate_keyring`
- `mysql_secure_installation`
- `mysql_tzinfo_to_sql`
- `mysqladmin`
- `mysqlbinlog`
- `mysqlcheck`
- `mysqld`
- `mysqld_multi`
- `mysqld_safe`
- `mysqldump`
- `mysqldumpslow`
- `mysqlimport`
- `mysqlrouter`
- `mysqlrouter_keyring`
- `mysqlrouter_passwd`
- `mysqlrouter_plugin_info`
- `mysqlshow`
- `mysqlslap`
- `mysqltest`
- `mysqltest_safe_process`
- `mysqlxtest`

## Available Versions

<details>
<summary>Show all 32 versions</summary>

- `9.6.0`, `9.5.0`, `9.4.0`, `9.3.0`, `9.2.0`
- `9.1.0`, `9.0.1`, `9.0.0`, `8.4.7`, `8.4.6`
- `8.4.5`, `8.4.4`, `8.4.3`, `8.4.2`, `8.4.1`
- `8.4.0`, `8.3.0`, `8.2.0`, `8.1.0`, `8.0.45`
- `8.0.44`, `8.0.43`, `8.0.42`, `8.0.41`, `8.0.40`
- `8.0.39`, `8.0.38`, `8.0.36`, `8.0.35`, `8.0.34`
- `8.0.33`, `8.0.32`

</details>

**Latest Version**: `9.6.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +mysql.com@9.6.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `unicode.org^71`
- `libevent.org^2`
- `lz4.org^1`
- `openssl.org^1.1`
- `protobuf.dev^21`
- `zlib.net^1.2`
- `facebook.com/zstd^1`
- `curl.se>=6.0`
- `thrysoee.dk/editline^3`
- `developers.yubico.com/libfido2^1`
- `linux:gnu.org/gcc/libstdcxx@14`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.mysql

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/mysql.com/package.yml)
- [Homepage](http://www.mysql.com/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
