# ladspa

> Linux Audio Developer's Simple Plugin

## Package Information

- **Domain**: `ladspa.org`
- **Name**: `ladspa`
- **Homepage**: https://www.ladspa.org
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/ladspa.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install ladspa.org
```

## Programs

This package provides the following executable programs:

- `analyseplugin`
- `applyplugin`
- `listplugins`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.17.0`

</details>

**Latest Version**: `1.17.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +ladspa.org@1.17.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `github.com/libsndfile/libsndfile^1.2`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.ladspa

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/ladspa.org/package.yml)
- [Homepage](https://www.ladspa.org)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
