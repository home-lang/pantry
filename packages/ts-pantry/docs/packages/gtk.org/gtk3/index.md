# gtk3

> Toolkit for creating graphical user interfaces

## Package Information

- **Domain**: `gtk.org/gtk3`
- **Name**: `gtk3`
- **Homepage**: <https://gtk.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gtk.org/gtk3/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gtk.org/gtk3
```

## Programs

This package provides the following executable programs:

- `gtk-builder-tool`
- `gtk-encode-symbolic-svg`
- `gtk-launch`
- `gtk-query-immodules-3.0`
- `gtk-query-settings`
- `gtk-update-icon-cache`
- `gtk3-demo`
- `gtk3-demo-application`
- `gtk3-icon-browser`
- `gtk3-widget-factory`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `3.24.38`

</details>

**Latest Version**: `3.24.38`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gtk.org/gtk3@3.24.38 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnome.org/atk`
- `gnome.org/gdk-pixbuf`
- `gnome.org/glib`
- `gnome.org/gsettings-desktop-schemas`
- `freedesktop.org/icon-theme`
- `github.com/anholt/libepoxy`
- `gnome.org/pango`
- `gnome.org/libxslt`
- `x.org/x11`
- `x.org/exts`
- `x.org/xrender`
- `x.org/xrandr`
- `x.org/xi`
- `ebassi.github.io/graphene`
- `xkbcommon.org`
- `debian.org/iso-codes`
- `freedesktop.org/at-spi2-atk`
- `linux:cairographics.org`
- `linux:wayland.freedesktop.org/protocols`
- `linux:x.org/protocol`
- `linux:openprinting.github.io/cups`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.gtk3

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gtk.org/gtk3/package.yml)
- [Homepage](https://gtk.org/)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
