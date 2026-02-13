# whisper

> Port of OpenAI's Whisper model in C/C++

## Package Information

- **Domain**: `github.com/ggerganov/whisper.cpp`
- **Name**: `whisper`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/ggerganov/whisper.cpp/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/ggerganov/whisper.cpp
```

## Programs

This package provides the following executable programs:

- `whisper.cpp`
- `whisper-cli`

## Available Versions

<details>
<summary>Show all 22 versions</summary>

- `1.8.3`, `1.8.2`, `1.8.1`, `1.8.0`, `1.7.6`
- `1.7.5`, `1.7.4`, `1.7.3`, `1.7.2`, `1.7.1`
- `1.7.0`, `1.6.2`, `1.6.1`, `1.6.0`, `1.5.5`
- `1.5.4`, `1.5.3`, `1.5.2`, `1.5.1`, `1.5.0`
- `1.4.3`, `1.4.0`

</details>

**Latest Version**: `1.8.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/ggerganov/whisper.cpp@1.8.3 -- $SHELL -i
```

## Dependencies

This package depends on:

- `libsdl.org`
- `linux:openmp.llvm.org^18 # as of 1.7.0`
- `linux:gnu.org/gcc/libstdcxx@14`

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

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/ggerganov/whisper.cpp/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
