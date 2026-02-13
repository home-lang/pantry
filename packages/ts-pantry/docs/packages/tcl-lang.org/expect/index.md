# expect

> Program that can automate interactive applications

## Package Information

- **Domain**: `tcl-lang.org/expect`
- **Name**: `expect`
- **Homepage**: https://core.tcl-lang.org/expect/index
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/tcl-lang.org/expect/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install tcl-lang.org/expect
```

## Programs

This package provides the following executable programs:

- `autoexpect`
- `autopasswd`
- `cryptdir`
- `decryptdir`
- `dislocate`
- `expect`
- `ftp-rfc`
- `kibitz`
- `lpunlock`
- `mkpasswd`
- `multixterm`
- `passmass`
- `rftp`
- `rlogin-cwd`
- `timed-read`
- `timed-run`
- `tknewsbiff`
- `tkpasswd`
- `unbuffer`
- `weather`
- `xkibitz`
- `xpstat`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `5.45.4`, `5.45.3`, `5.45.0`

</details>

**Latest Version**: `5.45.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +tcl-lang.org/expect@5.45.4 -- $SHELL -i
```

## Dependencies

This package depends on:

- `tcl.tk/tcl^8`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.expect

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/tcl-lang.org/expect/package.yml)
- [Homepage](https://core.tcl-lang.org/expect/index)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
