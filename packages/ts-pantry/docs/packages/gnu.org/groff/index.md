# groff

> GNU troff text-formatting system

## Package Information

- **Domain**: `gnu.org/groff`
- **Name**: `groff`
- **Homepage**: https://www.gnu.org/software/groff/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/groff/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnu.org/groff
```

## Programs

This package provides the following executable programs:

- `addftinfo`
- `afmtodit`
- `chem`
- `eqn`
- `eqn2graph`
- `gdiffmk`
- `glilypond`
- `gperl`
- `gpinyin`
- `grap2graph`
- `grn`
- `grodvi`
- `groff`
- `grog`
- `grolbp`
- `grolj4`
- `gropdf`
- `grops`
- `grotty`
- `hpftodit`
- `indxbib`
- `lkbib`
- `lookbib`
- `mmroff`
- `neqn`
- `nroff`
- `pdfmom`
- `pdfroff`
- `pfbtops`
- `pic`
- `pic2graph`
- `post-grohtml`
- `preconv`
- `pre-grohtml`
- `refer`
- `soelim`
- `tbl`
- `tfmtodit`
- `troff`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.23.0`

</details>

**Latest Version**: `1.23.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gnu.org/groff@1.23.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `ghostscript.com`
- `netpbm.sourceforge.net`
- `github.com/rrthomas/psutils`
- `freedesktop.org/uchardet`
- `perl.org`
- `linux:gnome.org/glib`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.groff

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/groff/package.yml)
- [Homepage](https://www.gnu.org/software/groff/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
