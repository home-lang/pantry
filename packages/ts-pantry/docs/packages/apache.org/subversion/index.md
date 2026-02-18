# svn

> Version control system designed to be a better CVS

## Package Information

- **Domain**: `apache.org/subversion`
- **Name**: `svn`
- **Homepage**: <https://subversion.apache.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/apache.org/subversion/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install apache.org/subversion
```

## Programs

This package provides the following executable programs:

- `svn`
- `svnadmin`
- `svnbench`
- `svndumpfilter`
- `svnfsfs`
- `svnlook`
- `svnmucc`
- `svnrdump`
- `svnserve`
- `svnsync`
- `svnversion`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `1.14.5`, `1.14.4`, `1.14.3`, `1.14.2`

</details>

**Latest Version**: `1.14.5`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +apache.org/subversion@1.14.5 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnu.org/gettext^0.21`
- `lz4.org^1`
- `openssl.org^1.1`
- `github.com/JuliaStrings/utf8proc^2`
- `libexpat.github.io^2`
- `kerberos.org^1.20`
- `sqlite.org^3`
- `zlib.net^1.2`
- `apache.org/apr^1`
- `apache.org/apr-util^1`
- `apache.org/serf^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.svn

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/apache.org/subversion/package.yml)
- [Homepage](https://subversion.apache.org/)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
