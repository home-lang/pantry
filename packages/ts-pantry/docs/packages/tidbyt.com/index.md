# pixlet

> Build apps for pixel-based displays ✨

## Package Information

- **Domain**: `tidbyt.com`
- **Name**: `pixlet`
- **Homepage**: https://tidbyt.com
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/tidbyt.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install tidbyt.com
```

## Programs

This package provides the following executable programs:

- `pixlet`

## Available Versions

<details>
<summary>Show all 20 versions</summary>

- `0.34.0`, `0.33.5`, `0.33.4`, `0.33.3`, `0.33.2`
- `0.33.1`, `0.33.0`, `0.32.7`, `0.32.6`, `0.32.5`
- `0.32.4`, `0.32.3`, `0.32.2`, `0.32.1`, `0.32.0`
- `0.31.0`, `0.30.2`, `0.30.1`, `0.30.0`, `0.29.1`

</details>

**Latest Version**: `0.34.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +tidbyt.com@0.34.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `google.com/webp^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.pixlet

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/tidbyt.com/package.yml)
- [Homepage](https://tidbyt.com)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
