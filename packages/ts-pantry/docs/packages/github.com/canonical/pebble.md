# canonical/pebble

> Pebble is a lightweight Linux service manager with layered configuration and an HTTP API.

## Package Information

- **Domain**: `github.com/canonical/pebble`
- **Name**: `canonical/pebble`
- **Homepage**: https://canonical-pebble.readthedocs-hosted.com/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/canonical/pebble/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/canonical/pebble
```

## Programs

This package provides the following executable programs:

- `pebble`

## Available Versions

<details>
<summary>Show all 37 versions</summary>

- `1.28.0`, `1.27.0`, `1.26.0`, `1.25.0`, `1.24.0`
- `1.23.0`, `1.22.2`, `1.22.1`, `1.22.0`, `1.21.0`
- `1.20.0`, `1.19.2`, `1.19.1`, `1.19.0`, `1.18.0`
- `1.17.0`, `1.16.0`, `1.15.0`, `1.14.1`, `1.14.0`
- `1.13.0`, `1.12.0`, `1.11.0`, `1.10.2`, `1.10.1`
- `1.10.0`, `1.9.1`, `1.9.0`, `1.8.0`, `1.7.4`
- `1.7.3`, `1.7.2`, `1.7.1`, `1.7.0`, `1.4.2`
- `1.4.1`, `1.1.1`

</details>

**Latest Version**: `1.28.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/canonical/pebble@1.28.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['canonical/pebble']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/canonical/pebble/package.yml)
- [Homepage](https://canonical-pebble.readthedocs-hosted.com/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
