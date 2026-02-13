# apko

> Build OCI images from APK packages directly without Dockerfile

## Package Information

- **Domain**: `github.com/chainguard-dev/apko`
- **Name**: `apko`
- **Homepage**: https://apko.dev
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/chainguard-dev/apko/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/chainguard-dev/apko
```

## Programs

This package provides the following executable programs:

- `apko`

## Available Versions

<details>
<summary>Show all 102 versions</summary>

- `1.0.4`, `1.0.3`, `1.0.2`, `1.0.1`, `1.0.0`
- `0.30.35`, `0.30.34`, `0.30.33`, `0.30.32`, `0.30.31`
- `0.30.30`, `0.30.29`, `0.30.28`, `0.30.27`, `0.30.26`
- `0.30.25`, `0.30.24`, `0.30.23`, `0.30.22`, `0.30.21`
- `0.30.20`, `0.30.18`, `0.30.17`, `0.30.16`, `0.30.15`
- `0.30.14`, `0.30.13`, `0.30.12`, `0.30.11`, `0.30.10`
- `0.30.9`, `0.30.8`, `0.30.7`, `0.30.6`, `0.30.5`
- `0.30.4`, `0.30.3`, `0.30.2`, `0.30.1`, `0.30.0`
- `0.29.10`, `0.29.9`, `0.29.8`, `0.29.7`, `0.29.6`
- `0.29.5`, `0.29.4`, `0.29.3`, `0.29.2`, `0.29.1`
- `0.29.0`, `0.28.0`, `0.27.9`, `0.27.8`, `0.27.7`
- `0.27.6`, `0.27.5`, `0.27.4`, `0.27.3`, `0.27.2`
- `0.27.1`, `0.27.0`, `0.26.1`, `0.26.0`, `0.25.7`
- `0.25.6`, `0.25.5`, `0.25.4`, `0.25.3`, `0.25.2`
- `0.25.1`, `0.25.0`, `0.24.0`, `0.23.0`, `0.22.7`
- `0.22.6`, `0.22.5`, `0.22.4`, `0.22.3`, `0.22.2`
- `0.22.1`, `0.22.0`, `0.21.0`, `0.20.2`, `0.20.1`
- `0.20.0`, `0.19.9`, `0.19.8`, `0.19.7`, `0.19.6`
- `0.19.5`, `0.19.4`, `0.19.3`, `0.19.1`, `0.18.1`
- `0.18.0`, `0.16.0`, `0.14.7`, `0.14.6`, `0.14.5`
- `0.14.1`, `0.13.3`

</details>

**Latest Version**: `1.0.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/chainguard-dev/apko@1.0.4 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.apko

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/chainguard-dev/apko/package.yml)
- [Homepage](https://apko.dev)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
