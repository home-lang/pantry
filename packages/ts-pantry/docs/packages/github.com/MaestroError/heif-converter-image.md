# heif-converter

> heif-converter is a versatile command-line application, along with a Docker image, that offers an easy and efficient way to convert HEIC (and AVIF) images to other common formats like JPEG and PNG, and vice versa. It leverages the go-libheif module, a GoLang wrapper for the libheif library.

## Package Information

- **Domain**: `github.com/MaestroError/heif-converter-image`
- **Name**: `heif-converter`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/MaestroError/heif-converter-image/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/MaestroError/heif-converter-image
```

## Programs

This package provides the following executable programs:

- `heif-converter`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `2023.6.23`

</details>

**Latest Version**: `2023.6.23`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/MaestroError/heif-converter-image@2023.6.23 -- $SHELL -i
```

## Dependencies

This package depends on:

- `github.com/strukturag/libheif`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['heif-converter']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/MaestroError/heif-converter-image/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
