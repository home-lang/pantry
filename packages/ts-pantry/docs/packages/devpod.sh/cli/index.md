# devpod

> Codespaces but open-source, client-only and unopinionated: Works with any IDE and lets you use any cloud, kubernetes or just localhost docker.

## Package Information

- **Domain**: `devpod.sh/cli`
- **Name**: `devpod`
- **Homepage**: <https://devpod.sh>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/devpod.sh/cli/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install devpod.sh/cli
```

## Programs

This package provides the following executable programs:

- `devpod`

## Available Versions

<details>
<summary>Show all 32 versions</summary>

- `0.6.15`, `0.6.14`, `0.6.13`, `0.6.12`, `0.6.11`, `0.6.10`, `0.6.9`, `0.6.8`, `0.6.7`, `0.6.6`, `0.6.5`, `0.6.4`, `0.6.2`, `0.6.1`, `0.6.0`
- `0.5.22`, `0.5.21`, `0.5.20`, `0.5.19`, `0.5.18`, `0.5.16`, `0.5.15`, `0.5.14`, `0.5.13`, `0.5.12`, `0.5.11`, `0.5.10`, `0.5.9`, `0.5.8`, `0.5.7`, `0.5.6`, `0.5.5`

</details>

**Latest Version**: `0.6.15`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +devpod.sh/cli@0.6.15 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.devpod

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/devpod.sh/cli/package.yml)
- [Homepage](https://devpod.sh)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
