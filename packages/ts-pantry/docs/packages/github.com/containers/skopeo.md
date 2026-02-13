# skopeo

> Work with remote images registries - retrieving information, images, signing content

## Package Information

- **Domain**: `github.com/containers/skopeo`
- **Name**: `skopeo`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/containers/skopeo/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/containers/skopeo
```

## Programs

This package provides the following executable programs:

- `skopeo`

## Available Versions

<details>
<summary>Show all 19 versions</summary>

- `1.21.0`, `1.20.0`, `1.19.0`, `1.18.0`, `1.17.0`
- `1.16.1`, `1.16.0`, `1.15.2`, `1.15.1`, `1.15.0`
- `1.14.5`, `1.14.4`, `1.14.3`, `1.14.2`, `1.14.1`
- `1.14.0`, `1.13.3`, `1.11.4`, `1.11.3`

</details>

**Latest Version**: `1.21.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/containers/skopeo@1.21.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `curl.se/ca-certs`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.skopeo

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/containers/skopeo/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
