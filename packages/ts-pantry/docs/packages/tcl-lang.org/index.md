# tcl-lang

> Tool Command Language

## Package Information

- **Domain**: `tcl-lang.org`
- **Name**: `tcl-lang`
- **Homepage**: https://www.tcl-lang.org
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/tcl-lang.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install tcl-lang.org
```

## Programs

This package provides the following executable programs:

- `tclsh`
- `wish`
- `critcl`

## Available Versions

<details>
<summary>Show all 9 versions</summary>

- `9.0.3`, `9.0.2`, `9.0.1`, `9.0.0`, `8.6.17`
- `8.6.16`, `8.6.15`, `8.6.14`, `8.6.13`

</details>

**Latest Version**: `9.0.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +tcl-lang.org@9.0.3 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1.1`
- `zlib.net^1.3`
- `freetype.org^2`
- `freedesktop.org/pkg-config^0.29`
- `x.org/x11=1.8.11`
- `x.org/exts^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['tcl-lang']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/tcl-lang.org/package.yml)
- [Homepage](https://www.tcl-lang.org)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
