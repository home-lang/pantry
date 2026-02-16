# gnuplot

> Command-driven, interactive function plotting

## Package Information

- **Domain**: `gnuplot.info`
- **Name**: `gnuplot`
- **Homepage**: http://www.gnuplot.info/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnuplot.info/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnuplot.info
```

## Programs

This package provides the following executable programs:

- `gnuplot`

## Available Versions

<details>
<summary>Show all 10 versions</summary>

- `6.0.4`, `6.0.3`, `6.0.2`, `6.0.1`, `6.0.0`
- `5.4.10`, `5.4.9`, `5.4.8`, `5.4.7`, `5.4.6`

</details>

**Latest Version**: `6.0.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gnuplot.info@6.0.4 -- $SHELL -i
```

## Dependencies

This package depends on:

- `libgd.github.io`
- `lua.org`
- `gnome.org/pango`
- `gnu.org/readline`
- `linux:github.com/AOMediaCodec/libavif^0.11`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.gnuplot

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnuplot.info/package.yml)
- [Homepage](http://www.gnuplot.info/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
