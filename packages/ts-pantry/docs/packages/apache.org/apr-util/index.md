# apu-1-config

> Mirror of Apache Portable Runtime util

## Package Information

- **Domain**: `apache.org/apr-util`
- **Name**: `apu-1-config`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/apache.org/apr-util/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install apache.org/apr-util
```

## Programs

This package provides the following executable programs:

- `apu-1-config`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.6.3`

</details>

**Latest Version**: `1.6.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +apache.org/apr-util@1.6.3 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['apu-{{ version.major }}-config']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/apache.org/apr-util/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
