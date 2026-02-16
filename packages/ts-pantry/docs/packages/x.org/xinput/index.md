# xinput

> Utility to configure and test X input devices

## Package Information

- **Domain**: `x.org/xinput`
- **Name**: `xinput`
- **Homepage**: <https://gitlab.freedesktop.org/xorg/app/xinput>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/x.org/xinput/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install x.org/xinput
```

## Programs

This package provides the following executable programs:

- `xinput`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.6.4`

</details>

**Latest Version**: `1.6.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +x.org/xinput@1.6.4 -- $SHELL -i
```

## Dependencies

This package depends on:

- `x.org/x11`
- `x.org/exts`
- `x.org/xi`
- `x.org/xinerama`
- `x.org/xrandr`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.xinput

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/x.org/xinput/package.yml)
- [Homepage](https://gitlab.freedesktop.org/xorg/app/xinput)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
