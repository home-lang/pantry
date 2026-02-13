# ruby-lang

> Powerful, clean, object-oriented scripting language

## Package Information

- **Domain**: `ruby-lang.org`
- **Name**: `ruby-lang`
- **Homepage**: https://www.ruby-lang.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/ruby-lang.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install ruby
```

## Programs

This package provides the following executable programs:

- `erb`
- `irb`
- `rake`
- `rdoc`
- `ri`
- `ruby`

## Aliases

This package can also be accessed using these aliases:

- `ruby`

## Available Versions

<details>
<summary>Show all 52 versions</summary>

- `4.0.1`, `4.0.0`, `3.4.8`, `3.4.7`, `3.4.6`
- `3.4.5`, `3.4.4`, `3.4.3`, `3.4.2`, `3.4.1`
- `3.3.10`, `3.3.9`, `3.3.8`, `3.3.7`, `3.3.6`
- `3.3.5`, `3.3.4`, `3.3.3`, `3.3.2`, `3.3.1`
- `3.3.0`, `3.2.10`, `3.2.9`, `3.2.8`, `3.2.7`
- `3.2.6`, `3.2.5`, `3.2.4`, `3.2.3`, `3.2.2`
- `3.2.1`, `3.2.0`, `3.1.7`, `3.1.6`, `3.1.5`
- `3.1.4`, `3.1.3`, `3.1.2`, `3.1.1`, `3.1.0`
- `3.0.7`, `3.0.6`, `3.0.5`, `3.0.4`, `3.0.3`
- `3.0.2`, `3.0.1`, `3.0.0`, `2.7.8`, `2.7.6`
- `2.6.10`, `2.5.9`

</details>

**Latest Version**: `4.0.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +ruby-lang.org@4.0.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1.1`
- `pyyaml.org^0.2`
- `zlib.net^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.ruby

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/ruby-lang.org/package.yml)
- [Homepage](https://www.ruby-lang.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
