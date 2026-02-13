# periphery

> A tool to identify unused code in Swift projects.

## Package Information

- **Domain**: `github.com/peripheryapp/periphery`
- **Name**: `periphery`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/peripheryapp/periphery/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/peripheryapp/periphery
```

## Programs

This package provides the following executable programs:

- `periphery`

## Available Versions

<details>
<summary>Show all 9 versions</summary>

- `3.4.0`, `3.3.0`, `3.2.0`, `3.1.0`, `3.0.3`
- `3.0.2`, `3.0.1`, `3.0.0`, `2.21.2`

</details>

**Latest Version**: `3.4.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/peripheryapp/periphery@3.4.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `curl.se`
- `gnome.org/libxml2`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.periphery

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/peripheryapp/periphery/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
