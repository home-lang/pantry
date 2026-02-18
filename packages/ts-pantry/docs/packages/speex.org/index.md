# speexdec

> Audio codec designed for speech

## Package Information

- **Domain**: `speex.org`
- **Name**: `speexdec`
- **Homepage**: <https://speex.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/speex.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install speex.org
```

## Programs

This package provides the following executable programs:

- `speexdec`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.2.1`

</details>

**Latest Version**: `1.2.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +speex.org@1.2.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `xiph.org/ogg`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.speexdec

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/speex.org/package.yml)
- [Homepage](https://speex.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
