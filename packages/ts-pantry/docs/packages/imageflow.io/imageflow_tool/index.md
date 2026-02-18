# imageflow_tool

> High-performance image manipulation for web servers. Includes imageflow_server, imageflow_tool, and libimageflow

## Package Information

- **Domain**: `imageflow.io/imageflow_tool`
- **Name**: `imageflow_tool`
- **Homepage**: <https://docs.imageflow.io/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/imageflow.io/imageflow_tool/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install imageflow.io/imageflow_tool
```

## Programs

This package provides the following executable programs:

- `imageflow_tool`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `2023.9.25`

</details>

**Latest Version**: `2023.9.25`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +imageflow.io/imageflow_tool@2023.9.25 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org@1.1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.imageflow_tool

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/imageflow.io/imageflow_tool/package.yml)
- [Homepage](https://docs.imageflow.io/)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
