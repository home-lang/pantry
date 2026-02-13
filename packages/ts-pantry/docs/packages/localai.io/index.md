# LocalAI

> :robot: The free, Open Source alternative to OpenAI, Claude and others. Self-hosted and local-first. Drop-in replacement for OpenAI, running on consumer-grade hardware. No GPU required. Runs gguf, transformers, diffusers and many more models architectures. Features: Generate Text, Audio, Video, Images, Voice Cloning, Distributed, P2P inference

## Package Information

- **Domain**: `localai.io`
- **Name**: `LocalAI`
- **Homepage**: https://localai.io
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/localai.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install localai.io
```

## Programs

This package provides the following executable programs:

- `local-ai`

## Available Versions

<details>
<summary>Show all 55 versions</summary>

- `3.10.0`, `3.9.0`, `3.8.0`, `3.7.0`, `3.6.0`
- `3.5.4`, `3.5.3`, `3.5.2`, `3.5.1`, `3.5.0`
- `3.4.0`, `3.3.2`, `3.3.1`, `3.3.0`, `3.2.3`
- `3.2.2`, `3.2.1`, `3.2.0`, `2.26.0`, `2.25.0`
- `2.24.2`, `2.24.1`, `2.24.0`, `2.23.0`, `2.22.1`
- `2.22.0`, `2.21.1`, `2.21.0`, `2.20.1`, `2.20.0`
- `2.19.4`, `2.19.3`, `2.19.2`, `2.19.1`, `2.19.0`
- `2.18.1`, `2.18.0`, `2.17.1`, `2.17.0`, `2.15.0`
- `2.14.0`, `2.13.0`, `2.12.4`, `2.12.3`, `2.12.1`
- `2.12.0`, `2.11.0`, `2.10.1`, `2.10.0`, `2.9.0`
- `2.8.2`, `2.8.1`, `2.8.0`, `2.7.0`, `2.6.1`

</details>

**Latest Version**: `3.10.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +localai.io@3.10.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `darwin:openmp.llvm.org@18`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.LocalAI

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/localai.io/package.yml)
- [Homepage](https://localai.io)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
