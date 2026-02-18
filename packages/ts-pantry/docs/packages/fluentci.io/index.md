# fluentci

> Set up and run your CI locally or in any CI Provider in a consistent way <https://backdropbuild.com/builds/v4/fluentci>

## Package Information

- **Domain**: `fluentci.io`
- **Name**: `fluentci`
- **Homepage**: <https://fluentci.io>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/fluentci.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install fluentci.io
```

## Programs

This package provides the following executable programs:

- `fluentci`

## Available Versions

<details>
<summary>Show all 70 versions</summary>

- `0.16.8`, `0.16.7`, `0.16.5`, `0.16.4`, `0.16.3`, `0.16.2`, `0.16.1`, `0.16.0`
- `0.15.9`, `0.15.8`, `0.15.7`, `0.15.6`, `0.15.5`, `0.15.4`, `0.15.3`, `0.15.2`, `0.15.1`, `0.15.0`
- `0.14.9`, `0.14.8`, `0.14.7`, `0.14.6`, `0.14.5`, `0.14.4`, `0.14.3`, `0.14.2`, `0.14.1`, `0.14.0`
- `0.13.2`, `0.13.1`, `0.13.0`
- `0.12.9`, `0.12.8`, `0.12.7`, `0.12.6`, `0.12.5`, `0.12.4`, `0.12.3`, `0.12.2`, `0.12.1`, `0.12.0`
- `0.11.9`, `0.11.8`, `0.11.7`, `0.11.6`, `0.11.5`, `0.11.4`, `0.11.3`, `0.11.2`, `0.11.1`, `0.11.0`
- `0.10.9`, `0.10.8`, `0.10.7`, `0.10.6`, `0.10.5`, `0.10.4`, `0.10.3`, `0.10.2`, `0.10.1`, `0.10.0`
- `0.9.1`, `0.9.0`
- `0.8.1`, `0.8.0`
- `0.7.1`, `0.7.0`
- `0.6.9`, `0.6.8`, `0.6.7`

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

*This documentation was auto-generated from package data.*
