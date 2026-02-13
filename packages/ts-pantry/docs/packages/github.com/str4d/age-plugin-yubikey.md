# age-plugin-yubikey

> Plugin for encrypting files with age and PIV tokens such as YubiKeys

## Package Information

- **Domain**: `github.com/str4d/age-plugin-yubikey`
- **Name**: `age-plugin-yubikey`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/str4d/age-plugin-yubikey/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/str4d/age-plugin-yubikey
```

## Programs

This package provides the following executable programs:

- `age-plugin-yubikey`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `0.5.0`, `0.4.0`

</details>

**Latest Version**: `0.5.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/str4d/age-plugin-yubikey@0.5.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `linux:pcsclite.apdu.fr^2`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['age-plugin-yubikey']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/str4d/age-plugin-yubikey/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
