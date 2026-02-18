# git-crypt

> Enable transparent encryption/decryption of files in a git repo

## Package Information

- **Domain**: `agwa.name/git-crypt`
- **Name**: `git-crypt`
- **Homepage**: <https://www.agwa.name/projects/git-crypt/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/agwa.name/git-crypt/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install agwa.name/git-crypt
```

## Programs

This package provides the following executable programs:

- `git-crypt`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `0.8.0`
- `0.7.0`

</details>

**Latest Version**: `0.8.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +agwa.name/git-crypt@0.8.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1.1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['git-crypt']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/agwa.name/git-crypt/package.yml)
- [Homepage](https://www.agwa.name/projects/git-crypt/)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
