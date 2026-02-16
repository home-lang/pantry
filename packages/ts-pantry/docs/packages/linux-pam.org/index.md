# linux-pam

> Linux PAM (Pluggable Authentication Modules for Linux) project

## Package Information

- **Domain**: `linux-pam.org`
- **Name**: `linux-pam`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/linux-pam.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install linux-pam.org
```

## Programs

This package provides the following executable programs:

- `faillock`
- `mkhomedir_helper`
- `pam_namespace_helper`
- `pam_timestamp_check`
- `unix_chkpwd`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `1.7.2`, `1.7.1`, `1.7.0`, `1.6.1`, `1.6.0`
- `1.5.3`

</details>

**Latest Version**: `1.7.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +linux-pam.org@1.7.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `github.com/thkukuk/libnsl`
- `sourceforge.net/libtirpc`
- `github.com/besser82/libxcrypt`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['linux-pam']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/linux-pam.org/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
