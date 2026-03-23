# Ollama

> A local LLM runner for running large language models.

## Package Information

- **Domain**: `ollama.com`
- **Name**: `Ollama`
- **Homepage**: <https://ollama.com>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/ollama.com/package.yml)

## Installation

```bash
# Install with pantry
pantry install ollama.com
```

## Programs

This package provides the following executable programs:

- `ollama`

## Aliases

This package can also be accessed using these aliases:

- `ollama`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `0.5.7`, `0.5.6`

</details>

**Latest Version**: `0.5.7`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +ollama.com@0.5.7 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.ollama

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/ollama.com/package.yml)
- [Homepage](https://ollama.com)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
