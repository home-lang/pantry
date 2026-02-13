# zx

> A tool for writing better scripts

## Package Information

- **Domain**: `google.com/zx`
- **Name**: `zx`
- **Homepage**: https://google.github.io/zx/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/google.com/zx/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install google.com/zx
```

## Programs

This package provides the following executable programs:

- `zx`

## Available Versions

<details>
<summary>Show all 43 versions</summary>

- `8.8.5`, `8.8.4`, `8.8.3`, `8.8.2`, `8.8.1`
- `8.8.0`, `8.7.2`, `8.7.1`, `8.7.0`, `8.6.2`
- `8.6.1`, `8.6.0`, `8.5.5`, `8.5.4`, `8.5.3`
- `8.5.2`, `8.5.0`, `8.4.1`, `8.4.0`, `8.3.2`
- `8.3.1`, `8.3.0`, `8.2.4`, `8.2.3`, `8.2.2`
- `8.2.1`, `8.2.0`, `8.1.9`, `8.1.8`, `8.1.7`
- `8.1.6`, `8.1.5`, `8.1.4`, `8.1.3`, `8.1.2`
- `8.1.1`, `8.1.0`, `8.0.2`, `8.0.1`, `8.0.0`
- `7.2.4`, `7.2.3`, `6.2.6`

</details>

**Latest Version**: `8.8.5`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +google.com/zx@8.8.5 -- $SHELL -i
```

## Dependencies

This package depends on:

- `nodejs.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.zx

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/google.com/zx/package.yml)
- [Homepage](https://google.github.io/zx/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
