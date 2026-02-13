# syncthing

> Open source continuous file synchronization application

## Package Information

- **Domain**: `syncthing.net`
- **Name**: `syncthing`
- **Homepage**: https://syncthing.net/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/syncthing.net/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install syncthing.net
```

## Programs

This package provides the following executable programs:

- `syncthing`

## Available Versions

<details>
<summary>Show all 34 versions</summary>

- `2.0.13`, `2.0.12`, `2.0.11`, `2.0.10`, `2.0.9`
- `2.0.8`, `2.0.7`, `2.0.6`, `2.0.5`, `2.0.4`
- `2.0.3`, `2.0.2`, `2.0.1`, `2.0.0`, `1.30.0`
- `1.29.7`, `1.29.6`, `1.29.5`, `1.29.4`, `1.29.3`
- `1.29.2`, `1.29.1`, `1.29.0`, `1.28.1`, `1.28.0`
- `1.27.12`, `1.27.11`, `1.27.10`, `1.27.9`, `1.27.8`
- `1.27.7`, `1.27.6`, `1.27.5`, `1.27.4`

</details>

**Latest Version**: `2.0.13`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +syncthing.net@2.0.13 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.syncthing

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/syncthing.net/package.yml)
- [Homepage](https://syncthing.net/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
