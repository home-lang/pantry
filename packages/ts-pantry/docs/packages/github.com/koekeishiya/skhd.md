# skhd

>  Simple hotkey daemon for macOS

## Package Information

- **Domain**: `github.com/koekeishiya/skhd`
- **Name**: `skhd`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/koekeishiya/skhd/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/koekeishiya/skhd
```

## Programs

This package provides the following executable programs:

- `skhd`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `0.3.9`

</details>

**Latest Version**: `0.3.9`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/koekeishiya/skhd@0.3.9 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.skhd

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/koekeishiya/skhd/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
