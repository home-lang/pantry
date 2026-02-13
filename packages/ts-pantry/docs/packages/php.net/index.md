# php

> General-purpose scripting language

## Package Information

- **Domain**: `php.net`
- **Name**: `php`
- **Homepage**: https://www.php.net/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/php.net/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install php.net
```

## Programs

This package provides the following executable programs:

- `pear`
- `pecl`
- `phar`
- `php`
- `php-cgi`
- `php-config`
- `phpdbg`
- `phpize`

## Available Versions

<details>
<summary>Show all 95 versions</summary>

- `8.5.2`, `8.5.1`, `8.5.0`, `8.4.17`, `8.4.16`
- `8.4.15`, `8.4.14`, `8.4.13`, `8.4.12`, `8.4.11`
- `8.4.10`, `8.4.9`, `8.4.8`, `8.4.7`, `8.4.6`
- `8.4.5`, `8.4.4`, `8.4.3`, `8.4.2`, `8.4.1`
- `8.4.0`, `8.3.30`, `8.3.29`, `8.3.28`, `8.3.27`
- `8.3.26`, `8.3.25`, `8.3.24`, `8.3.23`, `8.3.22`
- `8.3.21`, `8.3.20`, `8.3.19`, `8.3.18`, `8.3.17`
- `8.3.16`, `8.3.15`, `8.3.14`, `8.3.13`, `8.3.12`
- `8.3.11`, `8.3.10`, `8.3.9`, `8.3.8`, `8.3.7`
- `8.3.6`, `8.3.5`, `8.3.4`, `8.3.3`, `8.3.2`
- `8.3.1`, `8.3.0`, `8.2.30`, `8.2.29`, `8.2.28`
- `8.2.27`, `8.2.26`, `8.2.25`, `8.2.24`, `8.2.23`
- `8.2.22`, `8.2.21`, `8.2.20`, `8.2.19`, `8.2.18`
- `8.2.17`, `8.2.16`, `8.2.15`, `8.2.14`, `8.2.13`
- `8.2.12`, `8.2.11`, `8.2.10`, `8.2.9`, `8.2.8`
- `8.2.7`, `8.2.6`, `8.2.5`, `8.1.32`, `8.1.31`
- `8.1.30`, `8.1.29`, `8.1.28`, `8.1.27`, `8.1.26`
- `8.1.25`, `8.1.24`, `8.1.23`, `8.1.22`, `8.1.21`
- `8.1.20`, `8.1.18`, `8.0.30`, `8.0.28`, `7.4.33`

</details>

**Latest Version**: `8.5.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +php.net@8.5.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnu.org/bison^3`
- `re2c.org^3`
- `apache.org/apr^1`
- `apache.org/apr-util^1`
- `bcrypt.sourceforge.net^1`
- `gnu.org/autoconf^2`
- `curl.se^8`
- `gnu.org/gettext^0`
- `gnu.org/gmp^6`
- `libsodium.org<1.0.19`
- `libzip.org~1.9`
- `github.com/kkos/oniguruma^6`
- `openssl.org`
- `pcre.org/v2>=10.30`
- `sqlite.org^3`
- `unicode.org^71`
- `gnu.org/libiconv^1`
- `kerberos.org^1`
- `gnome.org/libxml2`
- `thrysoee.dk/editline^3`
- `sourceware.org/libffi>=3.4.7`
- `gnome.org/libxslt>=1.1.0<1.1.43`
- `libpng.org^1`
- `google.com/webp^1`
- `ijg.org^9`
- `gnu.org/sed^4 # phpize requires this`
- `openldap.org^2 # since 8.1.31, 8.2.26, 8.3.14, 8.4.0`
- `gnu.org/gcc/libstdcxx@14`
- `darwin:sourceware.org/bzip2^1`
- `darwin:zlib.net^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.php

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/php.net/package.yml)
- [Homepage](https://www.php.net/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
