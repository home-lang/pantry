# carapace

> Multi-shell multi-command argument completer

## Package Information

- **Domain**: `carapace.sh`
- **Name**: `carapace`
- **Homepage**: https://carapace.sh
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/carapace.sh/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install carapace.sh
```

## Programs

This package provides the following executable programs:

- `carapace`

## Available Versions

<details>
<summary>Show all 23 versions</summary>

- `1.6.0`, `1.5.7`, `1.5.6`, `1.5.5`, `1.5.4`
- `1.5.3`, `1.5.2`, `1.5.1`, `1.5.0`, `1.4.1`
- `1.4.0`, `1.3.3`, `1.3.2`, `1.3.1`, `1.3.0`
- `1.2.1`, `1.2.0`, `1.1.1`, `1.1.0`, `1.0.7`
- `1.0.6`, `1.0.5`, `1.0.4`

</details>

**Latest Version**: `1.6.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +carapace.sh@1.6.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.carapace

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/carapace.sh/package.yml)
- [Homepage](https://carapace.sh)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
