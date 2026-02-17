# factotum

> A system to programmatically run data pipelines

## Package Information

- **Domain**: `github.com/snowplow/factotum`
- **Name**: `factotum`
- **Homepage**: http://snowplowanalytics.com/blog/2016/04/09/introducing-factotum-data-pipeline-runner/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/snowplow/factotum/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/snowplow/factotum
```

## Programs

This package provides the following executable programs:

- `factotum`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `0.7.0`
- `0.6.1`, `0.6.0`

</details>

**Latest Version**: `0.7.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/snowplow/factotum@0.7.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1.1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.factotum

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/snowplow/factotum/package.yml)
- [Homepage](http://snowplowanalytics.com/blog/2016/04/09/introducing-factotum-data-pipeline-runner/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
