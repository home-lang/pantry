# po4a

> Maintain the translations of your documentation with ease (PO for anything)

## Package Information

- **Domain**: `po4a.org`
- **Name**: `po4a`
- **Homepage**: http://po4a.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/po4a.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install po4a.org
```

## Programs

This package provides the following executable programs:

- `msguntypot`
- `po4a`
- `po4a-display-man`
- `po4a-display-pod`
- `po4a-gettextize`
- `po4a-normalize`
- `po4a-updatepo`
- `podselect`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `0.74.0`
- `0.73.0`
- `0.72.0`
- `0.71.0`
- `0.70.0`
- `0.69.0`

</details>

**Latest Version**: `0.74.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +po4a.org@0.74.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnu.org/gettext^0.22`
- `perl.org^5.22`
- `gnome.org/libxslt^1.1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.po4a

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/po4a.org/package.yml)
- [Homepage](http://po4a.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
