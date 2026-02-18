# srt

> Secure, Reliable, Transport

## Package Information

- **Domain**: `srtalliance.org`
- **Name**: `srt`
- **Homepage**: <https://www.srtalliance.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/srtalliance.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install srtalliance.org
```

## Programs

This package provides the following executable programs:

- `srt-ffplay`
- `srt-file-transmit`
- `srt-live-transmit`
- `srt-tunnel`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `1.5.4`, `1.5.3`, `1.5.2`

</details>

**Latest Version**: `1.5.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +srtalliance.org@1.5.4 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.srt

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/srtalliance.org/package.yml)
- [Homepage](https://www.srtalliance.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
