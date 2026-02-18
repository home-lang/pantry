# s4cmd

> Super S3 command line tool

## Package Information

- **Domain**: `bloomreach.com/s4cmd`
- **Name**: `s4cmd`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/bloomreach.com/s4cmd/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install bloomreach.com/s4cmd
```

## Programs

This package provides the following executable programs:

- `s4cmd`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `2.1.0`

</details>

**Latest Version**: `2.1.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +bloomreach.com/s4cmd@2.1.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org>=3<3.12`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.s4cmd

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/bloomreach.com/s4cmd/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
