# nvm-exec

> Node Version Manager - POSIX-compliant bash script to manage multiple active node.js versions

## Package Information

- **Domain**: `github.com/nvm-sh/nvm`
- **Name**: `nvm-exec`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/nvm-sh/nvm/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/nvm-sh/nvm
```

## Programs

This package provides the following executable programs:

- `nvm-exec`

## Available Versions

<details>
<summary>Show all 8 versions</summary>

- `0.40.4`, `0.40.3`, `0.40.2`, `0.40.1`, `0.40.0`
- `0.39.7`, `0.39.6`, `0.39.5`

</details>

**Latest Version**: `0.40.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/nvm-sh/nvm@0.40.4 -- $SHELL -i
```

## Dependencies

This package depends on:

- `linux:curl.se`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['nvm-exec']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/nvm-sh/nvm/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
