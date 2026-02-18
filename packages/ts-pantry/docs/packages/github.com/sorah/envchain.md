# envchain

> Environment variables meet macOS Keychain and gnome-keyring <3

## Package Information

- **Domain**: `github.com/sorah/envchain`
- **Name**: `envchain`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/sorah/envchain/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/sorah/envchain
```

## Programs

This package provides the following executable programs:

- `envchain`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.1.0`

</details>

**Latest Version**: `1.1.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/sorah/envchain@1.1.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `linux:gnu.org/readline`
- `linux:gnome.org/libsecret`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.envchain

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/sorah/envchain/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
