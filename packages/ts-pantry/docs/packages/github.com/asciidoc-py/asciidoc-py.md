# asciidoc

> Formatter/translator for text files to numerous formats

## Package Information

- **Domain**: `github.com/asciidoc-py/asciidoc-py`
- **Name**: `asciidoc`
- **Homepage**: <https://asciidoc-py.github.io/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/asciidoc-py/asciidoc-py/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/asciidoc-py/asciidoc-py
```

## Programs

This package provides the following executable programs:

- `asciidoc`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `10.2.1`, `10.2.0`

</details>

**Latest Version**: `10.2.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/asciidoc-py/asciidoc-py@10.2.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `docbook.org`
- `python.org~3.11`
- `gnu.org/source-highlight`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.asciidoc

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/asciidoc-py/asciidoc-py/package.yml)
- [Homepage](https://asciidoc-py.github.io/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
