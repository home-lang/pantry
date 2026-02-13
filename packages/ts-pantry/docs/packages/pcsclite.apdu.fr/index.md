# pcsclite.apdu.fr

> Package from pantry: pcsclite.apdu.fr

## Package Information

- **Domain**: `pcsclite.apdu.fr`
- **Name**: `pcsclite.apdu.fr`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/pcsclite.apdu.fr/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install pcsclite.apdu.fr
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Dependencies

This package depends on:

- `libusb.info^1`
- `linux:systemd.io^254 # libudev`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['pcsclite.apdu.fr']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/pcsclite.apdu.fr/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
