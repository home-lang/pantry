# trezor-agent

> Hardware-based SSH/GPG/age agent

## Package Information

- **Domain**: `github.com/romanz/trezor-agent`
- **Name**: `trezor-agent`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/romanz/trezor-agent/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/romanz/trezor-agent
```

## Programs

This package provides the following executable programs:

- `jade-agent`
- `jade-gpg`
- `jade-gpg-agent`
- `keepkey-agent`
- `keepkeyctl`
- `ledger-agent`
- `ledger-gpg`
- `ledger-gpg-agent`
- `onlykey-agent`
- `onlykey-cli`
- `onlykey-gpg`
- `onlykey-gpg-agent`
- `trezor-agent`
- `trezor-gpg`
- `trezor-gpg-agent`
- `trezor-signify`
- `trezorctl`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `0.15.0`
- `0.14.8`

</details>

**Latest Version**: `0.15.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/romanz/trezor-agent@0.15.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org~3.12`
- `libusb.info^1`
- `darwin:libpng.org~1.6`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['trezor-agent']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/romanz/trezor-agent/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
