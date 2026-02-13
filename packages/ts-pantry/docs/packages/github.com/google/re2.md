# re2

> RE2 is a fast, safe, thread-friendly alternative to backtracking regular expression engines like those used in PCRE, Perl, and Python. It is a C++ library.

## Package Information

- **Domain**: `github.com/google/re2`
- **Name**: `re2`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/google/re2/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/google/re2
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Available Versions

<details>
<summary>Show all 11 versions</summary>

- `2025.11.5`, `2025.8.12`, `2025.8.5`, `2025.7.22`, `2025.7.17`
- `2025.6.26`, `2025.06.26b`, `2024.7.2`, `2024.7.1`, `2024.6.1`
- `2023.3.1`

</details>

**Latest Version**: `2025.11.5`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/google/re2@2025.11.5 -- $SHELL -i
```

## Dependencies

This package depends on:

- `abseil.io^20250127`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.re2

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/google/re2/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
