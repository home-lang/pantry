# gdown

> Google Drive Public File Downloader when Curl/Wget Fails

## Package Information

- **Domain**: `wkentaro.github.io/gdown`
- **Name**: `gdown`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/wkentaro.github.io/gdown/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install wkentaro.github.io/gdown
```

## Programs

This package provides the following executable programs:

- `gdown`

## Available Versions

<details>
<summary>Show all 8 versions</summary>

- `5.2.1`, `5.2.0`, `5.1.0`, `5.0.1`, `5.0.0`
- `4.7.3`, `4.7.2`, `4.7.1`

</details>

**Latest Version**: `5.2.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +wkentaro.github.io/gdown@5.2.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org~3.11`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.gdown

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/wkentaro.github.io/gdown/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
