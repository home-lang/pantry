# mesa3d.org

> Package from pantry: mesa3d.org

## Package Information

- **Domain**: `mesa3d.org`
- **Name**: `mesa3d.org`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/mesa3d.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install mesa3d.org
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Dependencies

This package depends on:

- `libexpat.github.io`
- `x.org/x11`
- `x.org/xcb`
- `x.org/xdamage`
- `x.org/exts`
- `invisible-island.net/ncurses`
- `zlib.net`
- `x.org/xrandr`
- `darwin:gnu.org/gettext`
- `linux:gnome.org/libxml2~2.13 # since 25.0.3, 2.14 changed the API version`
- `linux:elfutils.org`
- `linux:khronos.org/glslang`
- `linux:info-zip.org/zip`
- `linux:dri.freedesktop.org^2.4.110`
- `linux:intel.com/libva`
- `linux:freedesktop.org/vdpau`
- `linux:x.org/xfixes`
- `linux:x.org/xshmfence`
- `linux:x.org/xv`
- `linux:x.org/xxf86vm`
- `linux:llvm.org`
- `linux:github.com/lm-sensors/lm-sensors`
- `linux:wayland.freedesktop.org`
- `linux:wayland.freedesktop.org/protocols`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['mesa3d.org']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/mesa3d.org/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
