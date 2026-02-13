# Auto-GPT

> AutoGPT is the vision of accessible AI for everyone, to use and to build on. Our mission is to provide the tools, so that you can focus on what matters.

## Package Information

- **Domain**: `agpt.co`
- **Name**: `Auto-GPT`
- **Homepage**: https://agpt.co
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/agpt.co/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install agpt.co
```

## Programs

This package provides the following executable programs:

- `auto-gpt`

## Available Versions

<details>
<summary>Show all 9 versions</summary>

- `0.4.7`, `0.4.6`, `0.4.5`, `0.4.4`, `0.4.3`
- `0.4.2`, `0.4.0`, `0.3.1`, `0.3.0`

</details>

**Latest Version**: `0.4.7`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +agpt.co@0.4.7 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org>=3.10<3.12`
- `redis.io^7`
- `tea.xyz^0`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['Auto-GPT']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/agpt.co/package.yml)
- [Homepage](https://agpt.co)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
