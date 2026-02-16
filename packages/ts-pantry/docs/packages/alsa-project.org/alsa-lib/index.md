# aserver

> Provides audio and MIDI functionality to the Linux operating system

## Package Information

- **Domain**: `alsa-project.org/alsa-lib`
- **Name**: `aserver`
- **Homepage**: https://www.alsa-project.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/alsa-project.org/alsa-lib/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install alsa-project.org/alsa-lib
```

## Programs

This package provides the following executable programs:

- `aserver`

## Available Versions

<details>
<summary>Show all 9 versions</summary>

- `1.2.15.3`, `1.2.15.2`, `1.2.15.1`, `1.2.14`, `1.2.13`
- `1.2.12`, `1.2.11`, `1.2.10`, `1.2.9`

</details>

**Latest Version**: `1.2.15.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +alsa-project.org/alsa-lib@1.2.15.3 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.aserver

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/alsa-project.org/alsa-lib/package.yml)
- [Homepage](https://www.alsa-project.org/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
