# vhs

> Your CLI home video recorder 📼

## Package Information

- **Domain**: `charm.sh/vhs`
- **Name**: `vhs`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/charm.sh/vhs/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install charm.sh/vhs
```

## Programs

This package provides the following executable programs:

- `vhs`

## Available Versions

<details>
<summary>Show all 14 versions</summary>

- `0.10.0`
- `0.9.0`
- `0.8.0`
- `0.7.2`, `0.7.1`, `0.7.0`
- `0.6.0`
- `0.5.0`
- `0.4.0`
- `0.3.0`
- `0.2.0`
- `0.1.1`, `0.1.0`
- `0.0.1`

</details>

**Latest Version**: `0.10.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +charm.sh/vhs@0.10.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `ffmpeg.org>=5`
- `tsl0922.github.io/ttyd^1.7.2`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.vhs

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/charm.sh/vhs/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
