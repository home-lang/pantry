# pluto

> A cli tool to help discover deprecated apiVersions in Kubernetes

## Package Information

- **Domain**: `fairwinds.com/pluto`
- **Name**: `pluto`
- **Homepage**: <https://fairwinds.com>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/fairwinds.com/pluto/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install fairwinds.com/pluto
```

## Programs

This package provides the following executable programs:

- `pluto`

## Available Versions

<details>
<summary>Show all 27 versions</summary>

- `5.22.7`, `5.22.6`, `5.22.5`, `5.22.3`, `5.22.2`, `5.22.1`, `5.22.0`
- `5.21.9`, `5.21.8`, `5.21.7`, `5.21.6`, `5.21.4`, `5.21.3`, `5.21.2`, `5.21.1`, `5.21.0`
- `5.20.3`, `5.20.2`, `5.20.1`, `5.20.0`
- `5.19.4`, `5.19.3`, `5.19.2`, `5.19.1`, `5.19.0`
- `5.18.6`, `5.18.5`

</details>

**Latest Version**: `5.22.7`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +fairwinds.com/pluto@5.22.7 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.pluto

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/fairwinds.com/pluto/package.yml)
- [Homepage](https://fairwinds.com)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
