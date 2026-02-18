# rubberband

> Audio time stretcher tool and library

## Package Information

- **Domain**: `breakfastquay.com/rubberband`
- **Name**: `rubberband`
- **Homepage**: <https://breakfastquay.com/rubberband/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/breakfastquay.com/rubberband/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install breakfastquay.com/rubberband
```

## Programs

This package provides the following executable programs:

- `rubberband`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `4.0.0`
- `3.3.0`

</details>

**Latest Version**: `4.0.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +breakfastquay.com/rubberband@4.0.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `github.com/libsndfile/libsamplerate^0.2`
- `github.com/libsndfile/libsndfile^1.2`
- `linux:fftw.org^3.3`
- `linux:ladspa.org^1.17`
- `linux:vamp-plugins.org^2.9`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.rubberband

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/breakfastquay.com/rubberband/package.yml)
- [Homepage](https://breakfastquay.com/rubberband/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
