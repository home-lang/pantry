# ni

> 💡 Use the right package manager

## Package Information

- **Domain**: `github.com/antfu/ni`
- **Name**: `ni`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/antfu/ni/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/antfu/ni
```

## Programs

This package provides the following executable programs:

- `na`
- `nci`
- `ni`
- `nlx`
- `nr`
- `nu`
- `nun`

## Available Versions

<details>
<summary>Show all 33 versions</summary>

- `28.2.0`, `28.1.0`, `28.0.0`, `27.0.1`, `27.0.0`
- `26.2.0`, `26.1.0`, `26.0.1`, `26.0.0`, `25.0.0`
- `24.4.0`, `24.3.0`, `24.2.0`, `24.1.0`, `23.3.1`
- `23.3.0`, `23.2.0`, `0.23.2`, `0.23.1`, `0.23.0`
- `0.22.4`, `0.22.3`, `0.22.1`, `0.22.0`, `0.21.12`
- `0.21.11`, `0.21.10`, `0.21.9`, `0.21.8`, `0.21.7`
- `0.21.6`, `0.21.5`, `0.21.4`

</details>

**Latest Version**: `28.2.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/antfu/ni@28.2.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `nodejs.org>=14`
- `npmjs.com`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.ni

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/antfu/ni/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
