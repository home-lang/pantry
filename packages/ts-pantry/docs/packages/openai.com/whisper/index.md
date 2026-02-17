# whisper

> Robust Speech Recognition via Large-Scale Weak Supervision

## Package Information

- **Domain**: `openai.com/whisper`
- **Name**: `whisper`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/openai.com/whisper/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install openai.com/whisper
```

## Programs

This package provides the following executable programs:

- `whisper`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `20250625.0.0`
- `20240930.0.0`
- `20240927.0.0`
- `20231117.0.0`

</details>

**Latest Version**: `20250625.0.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +openai.com/whisper@20250625.0.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org~3.11`
- `ffmpeg.org^6.1`
- `huggingface.co^0.19`
- `pyyaml.org^0.2`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.whisper

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/openai.com/whisper/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
