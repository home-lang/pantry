# gist

> Potentially the best command line gister.

## Package Information

- **Domain**: `rubygems.org/gist`
- **Name**: `gist`
- **Homepage**: <http://defunkt.io/gist/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/rubygems.org/gist/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install rubygems.org/gist
```

## Programs

This package provides the following executable programs:

- `gist`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `6.0.0`

</details>

**Latest Version**: `6.0.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +rubygems.org/gist@6.0.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `ruby-lang.org^3`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.gist

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/rubygems.org/gist/package.yml)
- [Homepage](http://defunkt.io/gist/)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
