# paper

> Library and command-line tools for configuring and getting information on paper sizes

## Package Information

- **Domain**: `github.com/rrthomas/libpaper`
- **Name**: `paper`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/rrthomas/libpaper/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/rrthomas/libpaper
```

## Programs

This package provides the following executable programs:

- `paper`

## Available Versions

<details>
<summary>Show all 8 versions</summary>

- `2.2.7`, `2.2.6`, `2.2.5`, `2.2.4`, `2.2.3`
- `2.1.3`, `2.1.2`, `2.1.1`

</details>

**Latest Version**: `2.2.7`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/rrthomas/libpaper@2.2.7 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.paper

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/rrthomas/libpaper/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
