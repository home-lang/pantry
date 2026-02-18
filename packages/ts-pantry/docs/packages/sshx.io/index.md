# sshx

> Fast, collaborative live terminal sharing over the web

## Package Information

- **Domain**: `sshx.io`
- **Name**: `sshx`
- **Homepage**: <https://sshx.io>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/sshx.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install sshx.io
```

## Programs

This package provides the following executable programs:

- `sshx`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `2023.11.14`

</details>

**Latest Version**: `2023.11.14`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +sshx.io@2023.11.14 -- $SHELL -i
```

## Dependencies

This package depends on:

- `protobuf.dev`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.sshx

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/sshx.io/package.yml)
- [Homepage](https://sshx.io)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
