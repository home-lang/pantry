# yubikey-agent

> Seamless ssh-agent for YubiKeys and other PIV tokens

## Package Information

- **Domain**: `filippo.io/yubikey-agent`
- **Name**: `yubikey-agent`
- **Homepage**: https://filippo.io/yubikey-agent
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/filippo.io/yubikey-agent/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install filippo.io/yubikey-agent
```

## Programs

This package provides the following executable programs:

- `yubikey-agent`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `0.1.6`

</details>

**Latest Version**: `0.1.6`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +filippo.io/yubikey-agent@0.1.6 -- $SHELL -i
```

## Dependencies

This package depends on:

- `pcsclite.apdu.fr^2`
- `linux:gnupg.org/pinentry`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['yubikey-agent']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/filippo.io/yubikey-agent/package.yml)
- [Homepage](https://filippo.io/yubikey-agent)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
