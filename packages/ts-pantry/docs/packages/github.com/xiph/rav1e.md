# rav1e

> Fastest and safest AV1 video encoder

## Package Information

- **Domain**: `github.com/xiph/rav1e`
- **Name**: `rav1e`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/xiph/rav1e/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/xiph/rav1e
```

## Programs

This package provides the following executable programs:

- `rav1e`

## Available Versions

<details>
<summary>Show all 8 versions</summary>

- `0.8.1`, `0.8.0`
- `0.7.1`, `0.7.0`
- `0.6.6`, `0.6.5`, `0.6.4`, `0.6.3`

</details>

**Latest Version**: `0.8.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/xiph/rav1e@0.8.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `nasm.us^2.14.02`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.rav1e

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/xiph/rav1e/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
