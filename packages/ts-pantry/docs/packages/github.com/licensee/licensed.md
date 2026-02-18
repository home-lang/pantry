# licensed

> A Ruby gem to cache and verify the licenses of dependencies

## Package Information

- **Domain**: `github.com/licensee/licensed`
- **Name**: `licensed`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/licensee/licensed/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/licensee/licensed
```

## Programs

This package provides the following executable programs:

- `licensed`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `5.0.4`

</details>

**Latest Version**: `5.0.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/licensee/licensed@5.0.4 -- $SHELL -i
```

## Dependencies

This package depends on:

- `ruby-lang.org~3.4`
- `rubygems.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.licensed

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/licensee/licensed/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
