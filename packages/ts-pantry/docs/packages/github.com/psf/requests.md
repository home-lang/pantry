# requests

> A simple, yet elegant, HTTP library.

## Package Information

- **Domain**: `github.com/psf/requests`
- **Name**: `requests`
- **Homepage**: https://requests.readthedocs.io/en/latest/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/psf/requests/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/psf/requests
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Available Versions

<details>
<summary>Show all 7 versions</summary>

- `2.32.5`, `2.32.4`, `2.32.3`, `2.32.2`, `2.32.1`
- `2.32.0`, `2.31.0`

</details>

**Latest Version**: `2.32.5`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/psf/requests@2.32.5 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org~3.11`
- `github.com/Ousret/charset_normalizer^3`
- `github.com/kjd/idna^3`
- `github.com/urllib3/urllib3^2`
- `certifi.io/python-certifi^2024`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.requests

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/psf/requests/package.yml)
- [Homepage](https://requests.readthedocs.io/en/latest/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
