# mpv

> Media player based on MPlayer and mplayer2

## Package Information

- **Domain**: `mpv.io`
- **Name**: `mpv`
- **Homepage**: https://mpv.io
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/mpv.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install mpv.io
```

## Programs

This package provides the following executable programs:

- `mpv`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `0.41.0`, `0.40.0`, `0.39.0`, `0.38.0`

</details>

**Latest Version**: `0.41.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +mpv.io@0.41.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `ffmpeg.org`
- `libjpeg-turbo.org@2`
- `libarchive.org@3`
- `github.com/libass/libass^0.17`
- `videolan.org/libplacebo@6`
- `littlecms.com@2`
- `luajit.org@2`
- `mujs.com@1`
- `freedesktop.org/uchardet@0`
- `vapoursynth.com@66`
- `yt-dlp.org`
- `linux:alsa-project.org/alsa-lib@1`
- `linux:github.com/adah1972/libunibreak@6`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.mpv

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/mpv.io/package.yml)
- [Homepage](https://mpv.io)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
