# sketchybar

> A highly customizable macOS status bar replacement

## Package Information

- **Domain**: `felixkratz.github.io/SketchyBar`
- **Name**: `sketchybar`
- **Homepage**: <https://felixkratz.github.io/SketchyBar/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/felixkratz.github.io/SketchyBar/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install felixkratz.github.io/SketchyBar
```

## Programs

This package provides the following executable programs:

- `sketchybar`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `2.23.0`, `2.22.1`, `2.22.0`, `2.21.0`, `2.20.1`
- `2.20.0`

</details>

**Latest Version**: `2.23.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +felixkratz.github.io/SketchyBar@2.23.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `github.com/koekeishiya/yabai`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.sketchybar

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/felixkratz.github.io/SketchyBar/package.yml)
- [Homepage](https://felixkratz.github.io/SketchyBar/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
