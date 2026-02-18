# sniffnet

> Cross-platform application to monitor your network traffic

## Package Information

- **Domain**: `sniffnet.net`
- **Name**: `sniffnet`
- **Homepage**: <https://sniffnet.net>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/sniffnet.net/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install sniffnet.net
```

## Programs

This package provides the following executable programs:

- `sniffnet`

## Available Versions

<details>
<summary>Show all 5 versions</summary>

- `1.4.2`, `1.4.1`, `1.4.0`
- `1.3.2`, `1.3.1`

</details>

**Latest Version**: `1.4.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +sniffnet.net@1.4.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org@1`
- `tcpdump.org@1`
- `linux:alsa-project.org/alsa-lib@1`
- `linux:freedesktop.org/fontconfig@2`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.sniffnet

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/sniffnet.net/package.yml)
- [Homepage](https://sniffnet.net)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
