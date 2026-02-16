# xkbcli

> keymap handling library for toolkits and window systems

## Package Information

- **Domain**: `xkbcommon.org`
- **Name**: `xkbcli`
- **Homepage**: https://xkbcommon.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/xkbcommon.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install xkbcommon.org
```

## Programs

This package provides the following executable programs:

- `xkbcli`

## Available Versions

<details>
<summary>Show all 16 versions</summary>

- `1.13.0`, `1.12.4`, `1.12.3`, `1.12.2`, `1.12.1`
- `1.12.0`, `1.11.0`, `1.10.0`, `1.9.2`, `1.9.1`
- `1.9.0`, `1.8.1`, `1.8.0`, `1.7.0`, `1.6.0`
- `1.5.0`

</details>

**Latest Version**: `1.13.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +xkbcommon.org@1.13.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `x.org/x11`
- `x.org/xcb`
- `freedesktop.org/XKeyboardConfig`
- `gnome.org/libxml2`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.xkbcli

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/xkbcommon.org/package.yml)
- [Homepage](https://xkbcommon.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
