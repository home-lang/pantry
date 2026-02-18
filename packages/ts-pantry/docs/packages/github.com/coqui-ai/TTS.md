# TTS

> 🐸💬 - a deep learning toolkit for Text-to-Speech, battle-tested in research and production

## Package Information

- **Domain**: `github.com/coqui-ai/TTS`
- **Name**: `TTS`
- **Homepage**: <http://coqui.ai>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/coqui-ai/TTS/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/coqui-ai/TTS
```

## Programs

This package provides the following executable programs:

- `tts`
- `tts-server`
- `ttx`

## Available Versions

<details>
<summary>Show all 33 versions</summary>

- `0.22.0`
- `0.21.3`, `0.21.2`, `0.21.1`, `0.21.0`
- `0.20.6`, `0.20.5`, `0.20.4`, `0.20.3`, `0.20.2`, `0.20.1`, `0.20.0`
- `0.19.1`, `0.19.0`
- `0.18.2`, `0.18.1`, `0.18.0`
- `0.17.10`, `0.17.9`, `0.17.8`, `0.17.7`, `0.17.6`, `0.17.5`, `0.17.4`, `0.17.3`, `0.17.2`, `0.17.1`
- `0.16.6`, `0.16.5`, `0.16.4`, `0.16.3`, `0.16.2`
- `0.14.0`

</details>

**Latest Version**: `0.22.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/coqui-ai/TTS@0.22.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org>=3.7<3.11`
- `taku910.github.io/mecab`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.TTS

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/coqui-ai/TTS/package.yml)
- [Homepage](http://coqui.ai)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
