# opensearch

> 🔎 Open source distributed and RESTful search engine.

## Package Information

- **Domain**: `opensearch.org`
- **Name**: `opensearch`
- **Homepage**: <https://opensearch.org/docs/latest/opensearch/index/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/opensearch.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install opensearch.org
```

## Programs

This package provides the following executable programs:

- `opensearch`
- `opensearch-keystore`
- `opensearch-plugin`
- `opensearch-shard`

## Available Versions

<details>
<summary>Show all 17 versions</summary>

- `3.5.0`
- `3.4.0`
- `3.2.0`
- `3.1.0`
- `3.0.0`
- `2.19.3`, `2.19.2`, `2.19.1`
- `2.18.0`
- `2.17.1`, `2.17.0`
- `2.16.0`
- `2.15.0`
- `2.14.0`
- `2.13.0`
- `2.12.0`
- `2.11.1`

</details>

**Latest Version**: `3.5.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +opensearch.org@3.5.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openjdk.org^21 # since v3`
- `openmp.llvm.org^19`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.opensearch

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/opensearch.org/package.yml)
- [Homepage](https://opensearch.org/docs/latest/opensearch/index/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
