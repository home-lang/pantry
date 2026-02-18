# wezterm

> A GPU-accelerated cross-platform terminal emulator and multiplexer written by @wez and implemented in Rust

## Package Information

- **Domain**: `wezfurlong.org/wezterm`
- **Name**: `wezterm`
- **Homepage**: <https://wezfurlong.org/wezterm/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/wezfurlong.org/wezterm/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install wezfurlong.org/wezterm
```

## Programs

This package provides the following executable programs:

- `wezterm`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `2024.2.3`

</details>

**Latest Version**: `2024.2.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +wezfurlong.org/wezterm@2024.2.3 -- $SHELL -i
```

## Dependencies

This package depends on:

- `zlib.net^1.3`
- `linux:freetype.org`
- `linux:freedesktop.org/fontconfig`
- `linux:openssl.org^1.1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.wezterm

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/wezfurlong.org/wezterm/package.yml)
- [Homepage](https://wezfurlong.org/wezterm/)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
