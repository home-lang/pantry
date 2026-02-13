# pake

> 🤱🏻 Turn any webpage into a desktop app with Rust. 🤱🏻 利用 Rust 轻松构建轻量级多端桌面应用

## Package Information

- **Domain**: `npmjs.com/pake-cli`
- **Name**: `pake`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/npmjs.com/pake-cli/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install npmjs.com/pake-cli
```

## Programs

This package provides the following executable programs:

- `pake`

## Available Versions

<details>
<summary>Show all 16 versions</summary>

- `3.7.2`, `3.6.0`, `3.5.1`, `3.4.3`, `3.4.2`
- `3.4.0`, `3.3.5`, `3.2.16`, `3.2.14`, `3.1.1`
- `3.0.3`, `2.6.0`, `2.5.1`, `2.5.0`, `2.3.6`
- `2.3.5`

</details>

**Latest Version**: `3.7.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +npmjs.com/pake-cli@3.7.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `nodejs.org>=16`
- `npmjs.com`
- `rust-lang.org>=1.63`
- `rust-lang.org/cargo`
- `darwin:github.com/create-dmg/create-dmg@1`
- `linux:freedesktop.org/pkg-config^0.29`
- `linux:cairographics.org@1`
- `linux:gnome.org/pango@1`
- `linux:gnome.org/gdk-pixbuf@2`
- `linux:gnome.org/atk@2`
- `linux:libsoup.org~2.74`
- `linux:gnome.org/librsvg@2`
- `linux:gnome.org/vala@0`
- `linux:gtk.org/gtk3@3`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.pake

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/npmjs.com/pake-cli/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
