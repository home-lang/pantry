# MariaDB

> MariaDB server is a community developed fork of MySQL server. Started by core members of the original MySQL team, MariaDB actively works with outside developers to deliver the most featureful, stable, and sanely licensed open SQL server in the industry.

## Package Information

- **Domain**: `mariadb.com/server`
- **Name**: `MariaDB`
- **Homepage**: <https://mariadb.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/mariadb.com/server/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install mariadb.com/server
```

## Programs

This package provides the following executable programs:

- `aria_chk`
- `aria_dump_log`
- `aria_ftdump`
- `aria_pack`
- `aria_read_log`
- `aria_s3_copy`
- `innochecksum`
- `mariabackup`
- `mariadb`
- `mariadb-access`
- `mariadb-admin`
- `mariadb-backup`
- `mariadb-binlog`
- `mariadb-check`
- `mariadb-client-test`
- `mariadb-config`
- `mariadb-conv`
- `mariadb-convert-table-format`
- `mariadb-dump`
- `mariadb-dumpslow`
- `mariadb-find-rows`
- `mariadb-fix-extensions`
- `mariadb-hotcopy`
- `mariadb-import`
- `mariadb-plugin`
- `mariadb-secure-installation`
- `mariadb-setpermission`
- `mariadb-show`
- `mariadb-slap`
- `mariadb-test`
- `mariadb-tzinfo-to-sql`
- `mariadb-upgrade`
- `mariadb-waitpid`
- `mariadb_config`
- `mariadbd`
- `mariadbd-multi`
- `mariadbd-safe`
- `mariadbd-safe-helper`
- `mbstream`
- `msql2mysql`
- `my_print_defaults`
- `myisam_ftdump`
- `myisamchk`
- `myisamlog`
- `myisampack`
- `mysql`
- `mysql.server`
- `mysql_client_test`
- `mysql_config`
- `mysql_convert_table_format`
- `mysql_find_rows`
- `mysql_fix_extensions`
- `mysql_install_db`
- `mysql_plugin`
- `mysql_secure_installation`
- `mysql_setpermission`
- `mysql_tzinfo_to_sql`
- `mysql_upgrade`
- `mysql_waitpid`
- `mysqlaccess`
- `mysqladmin`
- `mysqlbinlog`
- `mysqlcheck`
- `mysqld`
- `mysqld_multi`
- `mysqld_safe`
- `mysqld_safe_helper`
- `mysqldump`
- `mysqldumpslow`
- `mysqlhotcopy`
- `mysqlimport`
- `mysqlshow`
- `mysqlslap`
- `mysqltest`
- `mytop`
- `perror`
- `replace`
- `resolve_stack_dump`
- `resolveip`
- `wsrep_sst_backup`
- `wsrep_sst_mariabackup`
- `wsrep_sst_mysqldump`
- `wsrep_sst_rsync`
- `wsrep_sst_rsync_wan`

## Available Versions

<details>
<summary>Show all 45 versions</summary>

- `12.3.1`
- `12.2.2`, `12.2.1`
- `12.1.2`, `12.1.1`
- `12.0.2`, `12.0.1`
- `11.8.6`, `11.8.5`, `11.8.4`, `11.8.3`, `11.8.2`, `11.8.1`, `11.8.0`
- `11.7.2`, `11.7.1`
- `11.6.2`, `11.6.1`
- `11.5.2`, `11.5.1`
- `11.4.10`, `11.4.9`, `11.4.8`, `11.4.7`, `11.4.6`, `11.4.5`, `11.4.2`, `11.4.1`
- `11.3.2`, `11.3.1`
- `11.2.2`, `11.2.1`
- `10.11.16`, `10.11.15`, `10.11.14`, `10.11.13`, `10.11.12`, `10.11.11`
- `10.6.25`, `10.6.24`, `10.6.23`, `10.6.22`, `10.6.21`
- `10.5.29`, `10.5.28`

</details>

**Latest Version**: `12.3.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +mariadb.com/server@12.3.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `sourceware.org/bzip2^1`
- `github.com/besser82/libxcrypt^4`
- `gnome.org/libxml2~2.13 # 2.14 changed the api version`
- `invisible-island.net/ncurses^6`
- `zlib.net^1`
- `openssl.org^1.1`
- `pcre.org/v2^10`
- `facebook.com/zstd^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.MariaDB

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/mariadb.com/server/package.yml)
- [Homepage](https://mariadb.org/)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
