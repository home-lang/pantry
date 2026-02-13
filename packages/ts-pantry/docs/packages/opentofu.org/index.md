# tofu

> OpenTofu lets you declaratively manage your cloud infrastructure.

## Package Information

- **Domain**: `opentofu.org`
- **Name**: `tofu`
- **Homepage**: https://opentofu.org
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/opentofu.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install opentofu.org
```

## Programs

This package provides the following executable programs:

- `tofu`

## Available Versions

<details>
<summary>Show all 40 versions</summary>

- `1.11.4`, `1.11.3`, `1.11.2`, `1.11.1`, `1.11.0`
- `1.10.8`, `1.10.7`, `1.10.6`, `1.10.5`, `1.10.4`
- `1.10.3`, `1.10.2`, `1.10.1`, `1.10.0`, `1.9.4`
- `1.9.3`, `1.9.2`, `1.9.1`, `1.9.0`, `1.8.11`
- `1.8.10`, `1.8.9`, `1.8.8`, `1.8.7`, `1.8.6`
- `1.8.5`, `1.8.4`, `1.8.3`, `1.8.2`, `1.8.1`
- `1.8.0`, `1.7.10`, `1.7.9`, `1.7.8`, `1.7.7`
- `1.7.6`, `1.7.5`, `1.7.4`, `1.7.3`, `1.6.0.3`

</details>

**Latest Version**: `1.11.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +opentofu.org@1.11.4 -- $SHELL -i
```

## Dependencies

This package depends on:

- `linux:gnu.org/gcc/libstdcxx`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.tofu

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/opentofu.org/package.yml)
- [Homepage](https://opentofu.org)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
