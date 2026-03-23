# fluentci

> Set up and run your CI locally or in any CI Provider in a consistent way <https://backdropbuild.com/builds/v4/fluentci>

## Package Information

- **Domain**: `fluentci.io`
- **Name**: `fluentci`
- **Homepage**: <https://fluentci.io>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/fluentci.io/package.yml)

## Installation

```bash
# Install with pantry
pantry install fluentci.io
```

## Programs

This package provides the following executable programs:

- `fluentci`

## Available Versions

<details>
<summary>Show all 20 versions</summary>

- `0.16.8`, `0.16.7`, `0.16.5`, `0.16.4`, `0.16.3`, `0.16.2`, `0.16.1`, `0.16.0`
- `0.15.9`, `0.15.8`, `0.15.7`, `0.15.6`, `0.15.5`, `0.15.4`, `0.15.3`, `0.15.2`, `0.15.1`, `0.15.0`
- `0.14.9`, `0.14.8`

</details>

**Latest Version**: `0.16.8`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +fluentci.io@0.16.8 -- $SHELL -i
```

## Dependencies

This package depends on:

- `dagger.io^0.10`
- `deno.land^1.42`
- `charm.sh/glow^1.5.1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.fluentci

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/fluentci.io/package.yml)
- [Homepage](https://fluentci.io)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
