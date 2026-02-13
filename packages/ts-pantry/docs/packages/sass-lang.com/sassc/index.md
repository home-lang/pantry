# sassc

> Wrapper around libsass that helps to create command-line apps

## Package Information

- **Domain**: `sass-lang.com/sassc`
- **Name**: `sassc`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/sass-lang.com/sassc/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install sass-lang.com/sassc
```

## Programs

This package provides the following executable programs:

- `sassc`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `3.6.2`

</details>

**Latest Version**: `3.6.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +sass-lang.com/sassc@3.6.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `sass-lang.com/libsass^3.6.5`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.sassc

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/sass-lang.com/sassc/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
