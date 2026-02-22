# colima

> Container runtimes on macOS (and Linux) with minimal setup

## Package Information

- **Domain**: `github.com/abiosoft/colima`
- **Name**: `colima`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/abiosoft/colima/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/abiosoft/colima
```

## Programs

This package provides the following executable programs:

- `colima`

## Available Versions

<details>
<summary>Show all 29 versions</summary>

- `0.10.1`, `0.10.0`
- `0.9.1`, `0.9.0`
- `0.8.4`, `0.8.3`, `0.8.2`, `0.8.1`, `0.8.0`
- `0.7.6`, `0.7.5`, `0.7.4`, `0.7.3`, `0.7.2`, `0.7.1`, `0.7.0`
- `0.6.10`, `0.6.9`, `0.6.8`, `0.6.7`, `0.6.6`, `0.6.5`, `0.6.4`, `0.6.3`, `0.6.2`, `0.6.1`, `0.6.0`
- `0.5.6`, `0.5.5`

</details>

**Latest Version**: `0.10.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/abiosoft/colima@0.10.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `lima-vm.io`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.colima

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/abiosoft/colima/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
