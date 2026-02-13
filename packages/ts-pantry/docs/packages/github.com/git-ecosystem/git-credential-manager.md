# git-credential-manager

> Secure, cross-platform Git credential storage with authentication to GitHub, Azure Repos, and other popular Git hosting services.

## Package Information

- **Domain**: `github.com/git-ecosystem/git-credential-manager`
- **Name**: `git-credential-manager`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/git-ecosystem/git-credential-manager/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/git-ecosystem/git-credential-manager
```

## Programs

This package provides the following executable programs:

- `git-credential-manager`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `2.7.0`, `2.6.1`

</details>

**Latest Version**: `2.7.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/git-ecosystem/git-credential-manager@2.7.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1.1.1`
- `unicode.org^71`
- `zlib.net^1.3`
- `dotnet.microsoft.com^8.0`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['git-credential-manager']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/git-ecosystem/git-credential-manager/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
