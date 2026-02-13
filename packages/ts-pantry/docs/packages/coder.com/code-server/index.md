# code-server

> Access VS Code through the browser

## Package Information

- **Domain**: `coder.com/code-server`
- **Name**: `code-server`
- **Homepage**: https://coder.com
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/coder.com/code-server/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install coder.com/code-server
```

## Programs

This package provides the following executable programs:

- `code-server`

## Available Versions

<details>
<summary>Show all 59 versions</summary>

- `4.108.1`, `4.108.0`, `4.107.1`, `4.107.0`, `4.106.3`
- `4.106.2`, `4.106.0`, `4.105.1`, `4.105.0`, `4.104.3`
- `4.104.2`, `4.104.1`, `4.104.0`, `4.103.2`, `4.103.1`
- `4.103.0`, `4.102.3`, `4.102.2`, `4.102.1`, `4.102.0`
- `4.101.2`, `4.101.1`, `4.101.0`, `4.100.3`, `4.100.2`
- `4.100.1`, `4.100.0`, `4.99.4`, `4.99.3`, `4.99.2`
- `4.99.1`, `4.99.0`, `4.98.2`, `4.98.0`, `4.97.2`
- `4.96.4`, `4.96.2`, `4.96.1`, `4.95.3`, `4.95.2`
- `4.95.1`, `4.93.1`, `4.92.2`, `4.91.1`, `4.91.0`
- `4.90.3`, `4.90.2`, `4.90.1`, `4.90.0`, `4.89.1`
- `4.89.0`, `4.23.1`, `4.23.0`, `4.22.1`, `4.22.0`
- `4.21.2`, `4.21.1`, `4.21.0`, `4.20.1`

</details>

**Latest Version**: `4.108.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +coder.com/code-server@4.108.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `nodejs.org^22 # since 4.101.0`
- `linux:gnome.org/libsecret^0.21`
- `linux:x.org/x11^1.8`
- `linux:x.org/xkbfile^1.1`
- `linux:kerberos.org^1.21`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['code-server']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/coder.com/code-server/package.yml)
- [Homepage](https://coder.com)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
