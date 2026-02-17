# asciidoctor

> :gem: A fast, open source text processor and publishing toolchain, written in Ruby, for converting AsciiDoc content to HTML 5, DocBook 5, and other formats.

## Package Information

- **Domain**: `asciidoctor.org`
- **Name**: `asciidoctor`
- **Homepage**: https://asciidoctor.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/asciidoctor.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install asciidoctor.org
```

## Programs

This package provides the following executable programs:

- `asciidoctor`

## Available Versions

<details>
<summary>Show all 9 versions</summary>

- `2.0.26`, `2.0.25`, `2.0.24`, `2.0.23`, `2.0.22`, `2.0.21`, `2.0.20`, `2.0.19`, `2.0.18`

</details>

**Latest Version**: `2.0.26`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +asciidoctor.org@2.0.26 -- $SHELL -i
```

## Dependencies

This package depends on:

- `ruby-lang.org^3.1`
- `rubygems.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.asciidoctor

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/asciidoctor.org/package.yml)
- [Homepage](https://asciidoctor.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
