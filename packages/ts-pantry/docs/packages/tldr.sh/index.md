# tldr

> C command-line client for tldr pages 📚

## Package Information

- **Domain**: `tldr.sh`
- **Name**: `tldr`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/tldr.sh/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install tldr.sh
```

## Programs

This package provides the following executable programs:

- `tldr`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `1.6.1`, `1.6.0`, `1.5.0`

</details>

**Latest Version**: `1.6.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +tldr.sh@1.6.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `linux:sourceware.org/bzip2^1`
- `curl.se`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.tldr

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/tldr.sh/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
