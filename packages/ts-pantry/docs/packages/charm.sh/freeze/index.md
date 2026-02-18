# freeze

> Generate images of code and terminal output 📸

## Package Information

- **Domain**: `charm.sh/freeze`
- **Name**: `freeze`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/charm.sh/freeze/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install charm.sh/freeze
```

## Programs

This package provides the following executable programs:

- `freeze`

## Available Versions

<details>
<summary>Show all 5 versions</summary>

- `0.2.2`, `0.2.1`, `0.2.0`
- `0.1.6`, `0.1.4`

</details>

**Latest Version**: `0.2.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +charm.sh/freeze@0.2.2 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.freeze

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/charm.sh/freeze/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
