# graphviz

> Graph visualization software from AT&T and Bell Labs

## Package Information

- **Domain**: `graphviz.org`
- **Name**: `graphviz`
- **Homepage**: <https://graphviz.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/graphviz.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install graphviz.org
```

## Programs

This package provides the following executable programs:

- `acyclic`
- `bcomps`
- `ccomps`
- `circo`
- `cluster`
- `dijkstra`
- `dot`
- `dot2gxl`
- `dot_builtins`
- `edgepaint`
- `fdp`
- `gc`
- `gml2gv`
- `graphml2gv`
- `gv2gml`
- `gv2gxl`
- `gvcolor`
- `gvgen`
- `gvmap`
- `gvmap.sh`
- `gvpack`
- `gvpr`
- `gxl2dot`
- `gxl2gv`
- `mm2gv`
- `neato`
- `nop`
- `osage`
- `patchwork`
- `prune`
- `sccmap`
- `sfdp`
- `tred`
- `twopi`
- `unflatten`

## Available Versions

<details>
<summary>Show all 24 versions</summary>

- `14.1.2`, `14.1.1`, `14.1.0`
- `14.0.5`, `14.0.4`, `14.0.2`, `14.0.1`, `14.0.0`
- `13.1.2`, `13.1.1`, `13.1.0`
- `13.0.1`, `13.0.0`
- `12.2.1`, `12.2.0`
- `12.1.2`, `12.1.1`, `12.1.0`
- `12.0.0`
- `11.0.0`
- `10.0.1`
- `9.0.0`
- `8.1.0`
- `7.1.0`

</details>

**Latest Version**: `14.1.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +graphviz.org@14.1.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `cairographics.org^1.1.10`
- `freedesktop.org/fontconfig^2.3.95`
- `freetype.org^2.1.0`
- `gnome.org/glib^2.11.0`
- `gnome.org/pango^1.12.4`
- `gnu.org/libtool^2`
- `libexpat.github.io^2.0.0`
- `libpng.org^1.2.10`
- `poppler.freedesktop.org`
- `zlib.net^1.2.3`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.graphviz

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/graphviz.org/package.yml)
- [Homepage](https://graphviz.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
