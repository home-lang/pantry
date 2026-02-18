# brewkit

> build infra & `$ bk build`

## Package Information

- **Domain**: `pkgx.sh/brewkit`
- **Name**: `brewkit`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/pkgx.sh/brewkit/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install pkgx.sh/brewkit
```

## Programs

This package provides the following executable programs:

- `bk`

## Available Versions

<details>
<summary>Show all 68 versions</summary>

- `1.19.2`, `1.19.1`, `1.19.0`
- `1.18.2`, `1.18.1`, `1.18.0`
- `1.17.0`
- `1.16.0`
- `1.15.0`
- `1.14.3`, `1.14.2`, `1.14.1`
- `1.13.0`
- `1.12.0`
- `1.11.2`, `1.11.1`, `1.11.0`
- `1.10.7`, `1.10.6`, `1.10.5`, `1.10.4`, `1.10.3`, `1.10.2`, `1.10.1`, `1.10.0`
- `1.9.0`
- `1.8.2`, `1.8.1`, `1.8.0`
- `1.7.0`
- `1.6.0`
- `1.5.1`, `1.5.0`
- `1.4.0`
- `1.3.1`, `1.3.0`
- `1.2.4`, `1.2.3`, `1.2.2`, `1.2.1`
- `1.1.2`, `1.1.1`, `1.1.0`
- `1.0.2`, `1.0.1`, `1.0.0`
- `0.55.8`, `0.55.7`, `0.55.6`, `0.55.5`, `0.55.4`, `0.55.3`, `0.55.2`, `0.55.1`, `0.55.0`
- `0.54.0`
- `0.53.0`
- `0.52.1`, `0.52.0`
- `0.51.0`
- `0.50.0`
- `0.49.0`
- `0.48.0`
- `0.47.0`
- `0.46.4`, `0.46.3`, `0.46.2`, `0.46.1`

</details>

**Latest Version**: `1.19.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +pkgx.sh/brewkit@1.19.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `deno.land~1.39 # 1.40 shouts unskippable deprecation warnings`
- `gnu.org/bash^5`
- `pkgx.sh>=1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.brewkit

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/pkgx.sh/brewkit/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
