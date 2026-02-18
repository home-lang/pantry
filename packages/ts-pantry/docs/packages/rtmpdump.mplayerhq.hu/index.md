# rtmpdump

> Tool for downloading RTMP streaming media

## Package Information

- **Domain**: `rtmpdump.mplayerhq.hu`
- **Name**: `rtmpdump`
- **Homepage**: <https://rtmpdump.mplayerhq.hu/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/rtmpdump.mplayerhq.hu/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install rtmpdump.mplayerhq.hu
```

## Programs

This package provides the following executable programs:

- `rtmpdump`
- `rtmpgw`
- `rtmpsrv`
- `rtmpsuck`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `2.3.0`, `2.3.0`

</details>

**Latest Version**: `2.3.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +rtmpdump.mplayerhq.hu@2.3.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1.1`
- `zlib.net`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.rtmpdump

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/rtmpdump.mplayerhq.hu/package.yml)
- [Homepage](https://rtmpdump.mplayerhq.hu/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
