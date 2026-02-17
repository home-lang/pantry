# opencanaryd

> Modular and decentralised honeypot

## Package Information

- **Domain**: `github.com/thinkst/opencanary`
- **Name**: `opencanaryd`
- **Homepage**: http://opencanary.org
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/thinkst/opencanary/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/thinkst/opencanary
```

## Programs

This package provides the following executable programs:

- `opencanaryd`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `0.9.7`, `0.9.6`, `0.9.5`, `0.9.4`, `0.9.3`, `0.9.2`

</details>

**Latest Version**: `0.9.7`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/thinkst/opencanary@0.9.7 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org>=3.10<3.12`
- `tcpdump.org`
- `openssl.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.opencanaryd

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/thinkst/opencanary/package.yml)
- [Homepage](http://opencanary.org)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
