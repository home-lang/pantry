# nginx

> HTTP(S) server and reverse proxy, and IMAP/POP3 proxy server

## Package Information

- **Domain**: `nginx.org`
- **Name**: `nginx`
- **Homepage**: https://nginx.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/nginx.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install nginx.org
```

## Programs

This package provides the following executable programs:

- `nginx`

## Available Versions

<details>
<summary>Show all 24 versions</summary>

- `1.29.4`, `1.29.3`, `1.29.2`, `1.29.1`, `1.29.0`
- `1.28.1`, `1.28.0`, `1.27.5`, `1.27.4`, `1.27.3`
- `1.27.2`, `1.27.1`, `1.27.0`, `1.26.2`, `1.26.1`
- `1.26.0`, `1.25.5`, `1.25.4`, `1.25.3`, `1.25.2`
- `1.25.1`, `1.25.0`, `1.24.0`, `1.23.3`

</details>

**Latest Version**: `1.29.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +nginx.org@1.29.4 -- $SHELL -i
```

## Dependencies

This package depends on:

- `pcre.org^8.45 # switch to pcre.org/pcre2 once it`
- `zlib.net^1.2.13`
- `openssl.org^1.1.1k`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.nginx

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/nginx.org/package.yml)
- [Homepage](https://nginx.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
