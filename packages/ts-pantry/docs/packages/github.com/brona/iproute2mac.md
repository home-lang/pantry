# iproute2mac

> CLI wrapper for basic network utilites on Mac OS X inspired with iproute2 on Linux systems - ip command.

## Package Information

- **Domain**: `github.com/brona/iproute2mac`
- **Name**: `iproute2mac`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/brona/iproute2mac/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/brona/iproute2mac
```

## Programs

This package provides the following executable programs:

- `bridge`
- `ip`
- `iproute2mac.py`

## Available Versions

<details>
<summary>Show all 9 versions</summary>

- `1.7.2`, `1.7.0`
- `1.6.0`
- `1.5.4`, `1.5.3`, `1.5.2`, `1.5.1`, `1.5.0`
- `1.4.1`

</details>

**Latest Version**: `1.7.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/brona/iproute2mac@1.7.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org~3.12`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.iproute2mac

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/brona/iproute2mac/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
