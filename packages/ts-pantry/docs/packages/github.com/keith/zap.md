# zap

> A CLI for cleaning up after .apps

## Package Information

- **Domain**: `github.com/keith/zap`
- **Name**: `zap`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/keith/zap/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/keith/zap
```

## Programs

This package provides the following executable programs:

- `zap`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `1.2.0`
- `1.1.0`

</details>

**Latest Version**: `1.2.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/keith/zap@1.2.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.zap

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/keith/zap/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
