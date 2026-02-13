# lychee

> ⚡ Fast, async, stream-based link checker written in Rust. Finds broken URLs and mail addresses inside Markdown, HTML, reStructuredText, websites and more!

## Package Information

- **Domain**: `lychee.cli.rs`
- **Name**: `lychee`
- **Homepage**: https://lychee.cli.rs/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/lychee.cli.rs/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install lychee.cli.rs
```

## Programs

This package provides the following executable programs:

- `lychee`

## Available Versions

<details>
<summary>Show all 5 versions</summary>

- `0.15.1`, `0.15.0`, `0.14.3`, `0.14.2`, `0.14.1`

</details>

**Latest Version**: `0.15.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +lychee.cli.rs@0.15.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org>=1.1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.lychee

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/lychee.cli.rs/package.yml)
- [Homepage](https://lychee.cli.rs/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
