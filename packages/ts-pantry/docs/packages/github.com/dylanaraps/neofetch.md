# neofetch

> 🖼️ A command-line system information tool written in bash 3.2+

## Package Information

- **Domain**: `github.com/dylanaraps/neofetch`
- **Name**: `neofetch`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/dylanaraps/neofetch/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/dylanaraps/neofetch
```

## Programs

This package provides the following executable programs:

- `neofetch`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `7.1.0`

</details>

**Latest Version**: `7.1.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/dylanaraps/neofetch@7.1.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `darwin:github.com/jhford/screenresolution`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.neofetch

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/dylanaraps/neofetch/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
