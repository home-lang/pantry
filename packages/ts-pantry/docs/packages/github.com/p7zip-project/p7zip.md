# p7zip

> A new p7zip fork with additional codecs and improvements (forked from https://sourceforge.net/projects/sevenzip/ AND https://sourceforge.net/projects/p7zip/).

## Package Information

- **Domain**: `github.com/p7zip-project/p7zip`
- **Name**: `p7zip`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/p7zip-project/p7zip/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/p7zip-project/p7zip
```

## Programs

This package provides the following executable programs:

- `7z`
- `7za`
- `7zr`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `17.5.0`

</details>

**Latest Version**: `17.5.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/p7zip-project/p7zip@17.5.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.p7zip

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/p7zip-project/p7zip/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
