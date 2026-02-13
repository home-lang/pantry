# SDL_image

> Image decoding for many popular formats for Simple Directmedia Layer.

## Package Information

- **Domain**: `libsdl.org/SDL_image`
- **Name**: `SDL_image`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/libsdl.org/SDL_image/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install libsdl.org/SDL_image
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Available Versions

<details>
<summary>Show all 15 versions</summary>

- `3.4.0`, `3.2.6`, `3.2.4`, `3.2.2`, `3.2.0`
- `2.8.8`, `2.8.6`, `2.8.5`, `2.8.4`, `2.8.3`
- `2.8.2`, `2.8.1`, `2.8.0`, `2.7.1`, `2.6.3`

</details>

**Latest Version**: `3.4.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +libsdl.org/SDL_image@3.4.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `libjpeg-turbo.org^2`
- `github.com/AOMediaCodec/libavif^0.11`
- `libpng.org^1.6`
- `simplesystems.org/libtiff^4.5`
- `libsdl.org^2`
- `google.com/webp^1.3`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.SDL_image

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/libsdl.org/SDL_image/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
