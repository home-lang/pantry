# gtk4

> Toolkit for creating graphical user interfaces

## Package Information

- **Domain**: `gtk.org/gtk4`
- **Name**: `gtk4`
- **Homepage**: https://gtk.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gtk.org/gtk4/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gtk.org/gtk4
```

## Programs

This package provides the following executable programs:

- `gtk4-builder-tool`
- `gtk4-demo`
- `gtk4-demo-application`
- `gtk4-encode-symbolic-svg`
- `gtk4-launch`
- `gtk4-node-editor`
- `gtk4-query-settings`
- `gtk4-print-editor`
- `gtk4-rendernode-tool`
- `gtk4-update-icon-cache`
- `gtk4-widget-factory`

## Available Versions

<details>
<summary>Show all 57 versions</summary>

- `4.21.4`, `4.21.3`, `4.21.2`, `4.21.1`, `4.21.0`
- `4.20.3`, `4.20.2`, `4.20.1`, `4.20.0`, `4.19.4`
- `4.19.3`, `4.19.2`, `4.19.1`, `4.19.0`, `4.18.6`
- `4.18.5`, `4.18.4`, `4.18.3`, `4.18.2`, `4.18.1`
- `4.17.6`, `4.17.5`, `4.17.4`, `4.17.3`, `4.17.2`
- `4.17.1`, `4.17.0`, `4.16.13`, `4.16.12`, `4.16.7`
- `4.16.6`, `4.16.5`, `4.16.4`, `4.16.3`, `4.16.2`
- `4.16.1`, `4.16.0`, `4.15.6`, `4.15.5`, `4.15.4`
- `4.15.3`, `4.15.2`, `4.15.1`, `4.15.0`, `4.14.5`
- `4.14.4`, `4.14.3`, `4.14.2`, `4.14.1`, `4.14.0`
- `4.13.9`, `4.13.8`, `4.13.7`, `4.13.6`, `4.13.5`
- `4.13.4`, `4.13.3`

</details>

**Latest Version**: `4.21.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gtk.org/gtk4@4.21.4 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnome.org/gdk-pixbuf^2.42`
- `gnome.org/glib^2.78`
- `gnome.org/librsvg^2.60 # since 4.19.2`
- `ebassi.github.io/graphene^1.10`
- `freedesktop.org/icon-theme^0.17`
- `libjpeg-turbo.org^2`
- `github.com/anholt/libepoxy^1.5.10`
- `libpng.org^1.6`
- `simplesystems.org/libtiff^4.6`
- `gnome.org/pango^1.50`
- `openprinting.github.io/cups^2.4`
- `github.com/KhronosGroup/Vulkan-Loader^1`
- `github.com/google/shaderc^2023`
- `linux:x.org/xi^1.8`
- `linux:x.org/xinerama^1.1`
- `linux:x.org/xcursor^1.2`
- `linux:xkbcommon.org^1.6`
- `linux:cairographics.org^1.18`
- `linux:wayland.freedesktop.org/protocols^1.43 # since 4.19.1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.gtk4

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gtk.org/gtk4/package.yml)
- [Homepage](https://gtk.org/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
