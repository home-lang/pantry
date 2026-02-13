# pcap-config

> the LIBpcap interface to various kernel packet capture mechanism

## Package Information

- **Domain**: `tcpdump.org`
- **Name**: `pcap-config`
- **Homepage**: https://www.tcpdump.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/tcpdump.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install tcpdump.org
```

## Programs

This package provides the following executable programs:

- `pcap-config`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `1.10.6`, `1.10.5`, `1.10.4`

</details>

**Latest Version**: `1.10.6`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +tcpdump.org@1.10.6 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['pcap-config']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/tcpdump.org/package.yml)
- [Homepage](https://www.tcpdump.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
