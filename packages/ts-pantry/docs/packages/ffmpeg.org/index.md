# ffmpeg

> Play, record, convert, and stream audio and video

## Package Information

- **Domain**: `ffmpeg.org`
- **Name**: `ffmpeg`
- **Homepage**: <https://ffmpeg.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/ffmpeg.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install ffmpeg.org
```

## Programs

This package provides the following executable programs:

- `ffmpeg`
- `ffplay`
- `ffprobe`

## Available Versions

<details>
<summary>Show all 32 versions</summary>

- `8.0.0`
- `7.1.3`, `7.1.2`, `7.1.1`, `7.1.0`
- `7.0.3`, `7.0.2`, `7.0.1`, `7.0.0`
- `6.1.4`, `6.1.3`, `6.1.2`, `6.1.1`, `6.1.0`
- `6.0.1`, `6.0.0`
- `5.1.8`, `5.1.7`, `5.1.6`, `5.1.5`, `5.1.4`, `5.1.2`
- `4.4.6`, `4.4.5`
- `4.3.9`, `4.3.8`, `4.3.7`
- `4.2.11`, `4.2.10`
- `4.1.11`
- `3.4.14`, `3.4.13`

</details>

**Latest Version**: `8.0.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +ffmpeg.org@8.0.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `lame.sourceforge.io>=3.98.3`
- `libsdl.org^2`
- `freetype.org^2`
- `harfbuzz.org^8`
- `videolan.org/x264^0.164`
- `videolan.org/x265^3`
- `webmproject.org/libvpx~1.14 # libvpx abi changes in 1.15`
- `opus-codec.org^1`
- `google.com/webp^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.ffmpeg

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/ffmpeg.org/package.yml)
- [Homepage](https://ffmpeg.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
