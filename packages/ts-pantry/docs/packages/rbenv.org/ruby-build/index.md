# ruby-build

> A tool to download, compile, and install Ruby on Unix-like systems.

## Package Information

- **Domain**: `rbenv.org/ruby-build`
- **Name**: `ruby-build`
- **Homepage**: https://rbenv.org/man/ruby-build.1
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/rbenv.org/ruby-build/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install rbenv.org/ruby-build
```

## Programs

This package provides the following executable programs:

- `ruby-build`

## Available Versions

<details>
<summary>Show all 63 versions</summary>

- `20260121.0.0`, `20260114.0.0`, `20260113.0.0`, `20260110.0.0`, `20251225.0.0`
- `20251218.0.0`, `20251217.0.0`, `20251203.0.0`, `20251117.0.0`, `20251023.0.0`
- `20251008.0.0`, `20250925.0.0`, `20250916.1.0`, `20250916.0.0`, `20250908.0.0`
- `20250829.0.0`, `20250811.0.0`, `20250724.0.0`, `20250716.0.0`, `20250610.0.0`
- `20250529.1.0`, `20250516.0.0`, `20250507.0.0`, `20250430.0.0`, `20250424.0.0`
- `20250418.0.0`, `20250415.0.0`, `20250409.0.0`, `20250326.0.0`, `20250318.0.0`
- `20250215.0.0`, `20250212.0.0`, `20250205.0.0`, `20250130.0.0`, `20250127.0.0`
- `20250121.0.0`, `20250115.0.0`, `20250114.0.0`, `20241225.2.0`, `20241225.1.0`
- `20241225.0.0`, `20241213.0.0`, `20241105.0.0`, `20241030.0.0`, `20241017.0.0`
- `20241007.0.0`, `20240917.0.0`, `20240903.0.0`, `20240727.0.0`, `20240722.0.0`
- `20240709.1.0`, `20240709.0.0`, `20240702.0.0`, `20240612.0.0`, `20240530.1.0`
- `20240530.0.0`, `20240517.0.0`, `20240501.0.0`, `20240423.0.0`, `20240416.0.0`
- `20240319.0.0`, `20240318.0.0`, `20240221.0.0`

</details>

**Latest Version**: `20260121.0.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +rbenv.org/ruby-build@20260121.0.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org>=1.1`
- `curl.se`
- `gnu.org/autoconf^2.72`
- `freedesktop.org/pkg-config`
- `gnu.org/readline^8.2`
- `pyyaml.org/libyaml^0.2`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['ruby-build']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/rbenv.org/ruby-build/package.yml)
- [Homepage](https://rbenv.org/man/ruby-build.1)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
