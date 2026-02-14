# gnome-extensions-cli

> Command line tool to manage your Gnome Shell extensions

## Package Information

- **Domain**: `github.com/essembeh/gnome-extensions-cli`
- **Name**: `gnome-extensions-cli`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/essembeh/gnome-extensions-cli/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/essembeh/gnome-extensions-cli
```

## Programs

This package provides the following executable programs:

- `gnome-extensions-cli`
- `gext`

## Available Versions

<details>
<summary>Show all 8 versions</summary>

- `0.10.8`, `0.10.7`, `0.10.6`, `0.10.5`, `0.10.4`
- `0.10.3`, `0.10.2`, `0.10.1`

</details>

**Latest Version**: `0.10.8`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/essembeh/gnome-extensions-cli@0.10.8 -- $SHELL -i
```

## Dependencies

This package depends on:

- `pkgx.sh>=1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['gnome-extensions-cli']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/essembeh/gnome-extensions-cli/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
