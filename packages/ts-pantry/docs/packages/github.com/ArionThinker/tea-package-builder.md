# tea-package-builder

> Tea Package Builder is a tool that helps create packages for Tea.xyz quickly and conveniently

## Package Information

- **Domain**: `github.com/ArionThinker/tea-package-builder`
- **Name**: `tea-package-builder`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/ArionThinker/tea-package-builder/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/ArionThinker/tea-package-builder
```

## Programs

This package provides the following executable programs:

- `tea-package-builder`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `0.1.6`, `0.1.5`, `0.1.4`, `0.1.3`, `0.1.2`
- `0.1.1`

</details>

**Latest Version**: `0.1.6`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/ArionThinker/tea-package-builder@0.1.6 -- $SHELL -i
```

## Dependencies

This package depends on:

- `linux:ffmpeg.org`
- `linux:gnome.org/gobject-introspection`
- `linux:gnome.org/glib^2`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['tea-package-builder']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/ArionThinker/tea-package-builder/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
