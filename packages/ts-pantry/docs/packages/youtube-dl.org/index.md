# youtube-dl

> Command-line program to download videos from YouTube.com and other video sites

## Package Information

- **Domain**: `youtube-dl.org`
- **Name**: `youtube-dl`
- **Homepage**: https://ytdl-org.github.io/youtube-dl/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/youtube-dl.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install youtube-dl.org
```

## Programs

This package provides the following executable programs:

- `youtube-dl`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `2023.8.4`, `2021.12.17`

</details>

**Latest Version**: `2023.8.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +youtube-dl.org@2023.8.4 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org>=3<3.12`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['youtube-dl']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/youtube-dl.org/package.yml)
- [Homepage](https://ytdl-org.github.io/youtube-dl/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
