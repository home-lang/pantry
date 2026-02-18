# glfw

> A multi-platform library for OpenGL, OpenGL ES, Vulkan, window and input

## Package Information

- **Domain**: `glfw.org`
- **Name**: `glfw`
- **Homepage**: <https://www.glfw.org>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/glfw.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install glfw.org
```

## Programs

This package provides the following executable programs:

No programs specified.

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `3.4.0`
- `3.3.10`, `3.3.9`

</details>

**Latest Version**: `3.4.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +glfw.org@3.4.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `linux:freeglut.sourceforge.io^3.4`
- `linux:x.org/xcursor^1.2`
- `linux:xkbcommon.org^1.0`
- `linux:mesa3d.org^23.3`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.glfw

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/glfw.org/package.yml)
- [Homepage](https://www.glfw.org)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
