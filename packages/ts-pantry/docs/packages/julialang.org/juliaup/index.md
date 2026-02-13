# juliaup

> Julia installer and version multiplexer

## Package Information

- **Domain**: `julialang.org/juliaup`
- **Name**: `juliaup`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/julialang.org/juliaup/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install julialang.org/juliaup
```

## Programs

This package provides the following executable programs:

- `juliaup`

## Available Versions

<details>
<summary>Show all 71 versions</summary>

- `1.19.4`, `1.19.3`, `1.19.2`, `1.19.1`, `1.19.0`
- `1.18.9`, `1.18.8`, `1.18.7`, `1.18.6`, `1.18.5`
- `1.18.4`, `1.18.3`, `1.18.2`, `1.18.1`, `1.18.0`
- `1.17.21`, `1.17.20`, `1.17.19`, `1.17.18`, `1.17.17`
- `1.17.16`, `1.17.15`, `1.17.14`, `1.17.13`, `1.17.12`
- `1.17.11`, `1.17.10`, `1.17.9`, `1.17.8`, `1.17.7`
- `1.17.6`, `1.17.5`, `1.17.4`, `1.17.3`, `1.17.2`
- `1.17.1`, `1.17.0`, `1.16.12`, `1.16.11`, `1.16.10`
- `1.16.9`, `1.16.8`, `1.16.7`, `1.16.6`, `1.16.5`
- `1.16.4`, `1.16.3`, `1.16.2`, `1.16.1`, `1.16.0`
- `1.15.0`, `1.14.9`, `1.14.8`, `1.14.7`, `1.14.6`
- `1.14.5`, `1.14.4`, `1.14.3`, `1.14.2`, `1.14.1`
- `1.14.0`, `1.13.1`, `1.13.0`, `1.12.5`, `1.12.4`
- `1.12.3`, `1.12.2`, `1.12.1`, `1.12.0`, `1.11.23`
- `1.11.22`

</details>

**Latest Version**: `1.19.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +julialang.org/juliaup@1.19.4 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.juliaup

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/julialang.org/juliaup/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
