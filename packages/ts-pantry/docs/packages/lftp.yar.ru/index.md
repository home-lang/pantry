# lftp

> sophisticated command line file transfer program (ftp, http, sftp, fish, torrent)

## Package Information

- **Domain**: `lftp.yar.ru`
- **Name**: `lftp`
- **Homepage**: https://lftp.yar.ru/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/lftp.yar.ru/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install lftp.yar.ru
```

## Programs

This package provides the following executable programs:

- `lftp`
- `lftpget`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `4.9.3`, `4.9.2`, `4.9.1`

</details>

**Latest Version**: `4.9.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +lftp.yar.ru@4.9.3 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnu.org/libidn2`
- `gnu.org/gettext`
- `gnu.org/readline`
- `openssl.org^1.1`
- `zlib.net`
- `invisible-island.net/ncurses`
- `libexpat.github.io`
- `linux:gnu.org/gcc/libstdcxx@14`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.lftp

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/lftp.yar.ru/package.yml)
- [Homepage](https://lftp.yar.ru/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
