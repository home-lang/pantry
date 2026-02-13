# nim-lang

> Nim is a statically typed compiled systems programming language. It combines successful concepts from mature languages like Python, Ada and Modula. Its design focuses on efficiency, expressiveness, and elegance (in that order of priority).

## Package Information

- **Domain**: `nim-lang.org`
- **Name**: `nim-lang`
- **Homepage**: https://nim-lang.org
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/nim-lang.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install nim-lang.org
```

## Programs

This package provides the following executable programs:

- `nim`
- `nim_dbg`
- `testament`
- `nimsuggest`
- `nimgrep`
- `nim-gdb`
- `atlas`
- `nimpretty`
- `nimble`

## Available Versions

<details>
<summary>Show all 16 versions</summary>

- `2.2.6`, `2.2.4`, `2.2.2`, `2.2.0`, `2.0.16`
- `2.0.14`, `2.0.12`, `2.0.8`, `2.0.6`, `2.0.4`
- `2.0.2`, `2.0.0`, `1.6.20`, `1.6.18`, `1.6.16`
- `1.6.14`

</details>

**Latest Version**: `2.2.6`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +nim-lang.org@2.2.6 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnu.org/gcc`
- `pcre.org`
- `openssl.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['nim-lang']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/nim-lang.org/package.yml)
- [Homepage](https://nim-lang.org)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
