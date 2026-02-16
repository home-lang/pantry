# libsdl

> Simple Directmedia Layer

## Package Information

- **Domain**: `libsdl.org`
- **Name**: `libsdl`
- **Homepage**: https://libsdl.org
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/libsdl.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install libsdl.org
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Available Versions

<details>
<summary>Show all 43 versions</summary>

- `3.4.0`, `3.2.30`, `3.2.28`, `3.2.26`, `3.2.24`
- `3.2.22`, `3.2.20`, `3.2.18`, `3.2.16`, `3.2.14`
- `3.2.12`, `3.2.10`, `3.2.8`, `3.2.6`, `3.2.4`
- `3.2.2`, `3.2.0`, `2.32.10`, `2.32.8`, `2.32.6`
- `2.32.4`, `2.32.2`, `2.32.0`, `2.30.12`, `2.30.11`
- `2.30.10`, `2.30.9`, `2.30.8`, `2.30.7`, `2.30.6`
- `2.30.5`, `2.30.4`, `2.30.3`, `2.30.2`, `2.30.1`
- `2.30.0`, `2.28.5`, `2.28.4`, `2.28.3`, `2.28.2`
- `2.28.1`, `2.28.0`, `2.26.5`

</details>

**Latest Version**: `3.4.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +libsdl.org@3.4.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `linux:alsa-project.org/alsa-lib>=1.0.11`
- `linux:x.org/x11`
- `linux:x.org/xcursor`
- `linux:x.org/xi`
- `linux:x.org/xrandr`
- `linux:x.org/xfixes`
- `linux:x.org/xrender`
- `linux:x.org/xscrnsaver`
- `linux:x.org/exts`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.libsdl

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/libsdl.org/package.yml)
- [Homepage](https://libsdl.org)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
