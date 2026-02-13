# streamlink

> Streamlink is a CLI utility which pipes video streams from various services into a video player

## Package Information

- **Domain**: `streamlink.github.io`
- **Name**: `streamlink`
- **Homepage**: https://streamlink.github.io/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/streamlink.github.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install streamlink.github.io
```

## Programs

This package provides the following executable programs:

- `streamlink`

## Available Versions

<details>
<summary>Show all 26 versions</summary>

- `8.1.2`, `8.1.1`, `8.1.0`, `8.0.0`, `7.6.0`
- `7.5.0`, `7.4.0`, `7.3.0`, `7.2.0`, `7.1.3`
- `7.1.2`, `7.1.1`, `7.1.0`, `7.0.0`, `6.11.0`
- `6.10.0`, `6.9.0`, `6.8.3`, `6.8.2`, `6.8.1`
- `6.8.0`, `6.7.4`, `6.7.3`, `6.7.2`, `6.7.1`
- `6.7.0`

</details>

**Latest Version**: `8.1.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +streamlink.github.io@8.1.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `pkgx.sh^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.streamlink

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/streamlink.github.io/package.yml)
- [Homepage](https://streamlink.github.io/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
