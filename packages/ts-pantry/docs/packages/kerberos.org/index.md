# kerberos

> mirror of MIT krb5 repository

## Package Information

- **Domain**: `kerberos.org`
- **Name**: `kerberos`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/kerberos.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install kerberos.org
```

## Programs

This package provides the following executable programs:

- `compile_et`
- `gss-client`
- `k5srvutil`
- `kadmin`
- `kdestroy`
- `kinit`
- `klist`
- `kpasswd`
- `krb5-config`
- `kswitch`
- `ktutil`
- `kvno`
- `sclient`
- `sim_client`
- `uuclient`
- `gss-server`
- `kadmin.local`
- `kadmind`
- `kdb5_util`
- `kprop`
- `kpropd`
- `kproplog`
- `krb5-send-pr`
- `krb5kdc`
- `sim_server`
- `sserver`
- `uuserver`

## Available Versions

<details>
<summary>Show all 9 versions</summary>

- `1.22.2`, `1.22.1`, `1.22.0`, `1.21.3`, `1.21.2`
- `1.21.1`, `1.21.0`, `1.20.2`, `1.20.1`

</details>

**Latest Version**: `1.22.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +kerberos.org@1.22.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1.1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.kerberos

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/kerberos.org/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../package-catalog.md)

---

_This documentation was auto-generated from package data._
