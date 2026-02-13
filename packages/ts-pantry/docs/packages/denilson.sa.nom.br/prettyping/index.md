# prettyping

> `prettyping` is a wrapper around the standard `ping` tool, making the output prettier, more colorful, more compact, and easier to read.

## Package Information

- **Domain**: `denilson.sa.nom.br/prettyping`
- **Name**: `prettyping`
- **Homepage**: https://denilsonsa.github.io/prettyping/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/denilson.sa.nom.br/prettyping/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install denilson.sa.nom.br/prettyping
```

## Programs

This package provides the following executable programs:

- `prettyping`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `1.1.0`, `1.0.1`

</details>

**Latest Version**: `1.1.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +denilson.sa.nom.br/prettyping@1.1.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.prettyping

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/denilson.sa.nom.br/prettyping/package.yml)
- [Homepage](https://denilsonsa.github.io/prettyping/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
