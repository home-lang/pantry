# moon

> A build system and monorepo management tool for the web ecosystem, written in Rust.

## Package Information

- **Domain**: `moonrepo.dev/moon`
- **Name**: `moon`
- **Homepage**: https://moonrepo.dev/moon
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/moonrepo.dev/moon/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install moonrepo.dev/moon
```

## Programs

This package provides the following executable programs:

- `moon`

## Available Versions

<details>
<summary>Show all 81 versions</summary>

- `1.41.8`, `1.41.7`, `1.41.6`, `1.41.5`, `1.41.4`
- `1.41.3`, `1.41.2`, `1.41.1`, `1.41.0`, `1.40.5`
- `1.40.4`, `1.40.3`, `1.40.2`, `1.40.1`, `1.40.0`
- `1.39.4`, `1.39.3`, `1.39.2`, `1.39.1`, `1.39.0`
- `1.38.6`, `1.38.5`, `1.38.4`, `1.38.3`, `1.38.2`
- `1.38.1`, `1.38.0`, `1.37.3`, `1.37.2`, `1.37.1`
- `1.37.0`, `1.36.3`, `1.36.2`, `1.36.1`, `1.36.0`
- `1.35.7`, `1.35.6`, `1.35.5`, `1.35.4`, `1.35.3`
- `1.35.2`, `1.35.1`, `1.35.0`, `1.34.3`, `1.34.2`
- `1.34.1`, `1.34.0`, `1.33.3`, `1.33.2`, `1.33.1`
- `1.33.0`, `1.32.9`, `1.32.8`, `1.32.7`, `1.32.6`
- `1.32.5`, `1.32.4`, `1.32.3`, `1.32.2`, `1.32.1`
- `1.32.0`, `1.31.3`, `1.31.2`, `1.31.1`, `1.31.0`
- `1.30.6`, `1.30.5`, `1.30.4`, `1.30.3`, `1.30.2`
- `1.30.1`, `1.30.0`, `1.29.4`, `1.29.3`, `1.29.2`
- `1.29.1`, `1.29.0`, `1.28.3`, `1.28.2`, `1.28.1`
- `1.25.4`

</details>

**Latest Version**: `1.41.8`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +moonrepo.dev/moon@1.41.8 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.moon

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/moonrepo.dev/moon/package.yml)
- [Homepage](https://moonrepo.dev/moon)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
