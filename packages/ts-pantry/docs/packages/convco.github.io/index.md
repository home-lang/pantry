# convco

> Conventional commits, changelog, versioning, validation

## Package Information

- **Domain**: `convco.github.io`
- **Name**: `convco`
- **Homepage**: <https://convco.github.io>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/convco.github.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install convco.github.io
```

## Programs

This package provides the following executable programs:

- `convco`

## Available Versions

<details>
<summary>Show all 9 versions</summary>

- `0.6.2`, `0.6.1`, `0.6.0`
- `0.5.2`, `0.5.1`, `0.5.0`
- `0.4.3`, `0.4.2`, `0.4.1`

</details>

**Latest Version**: `0.6.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +convco.github.io@0.6.2 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.convco

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/convco.github.io/package.yml)
- [Homepage](https://convco.github.io)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
