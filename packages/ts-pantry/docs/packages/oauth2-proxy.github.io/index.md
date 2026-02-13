# oauth2-proxy

> A reverse proxy that provides authentication with Google, Azure, OpenID Connect and many more identity providers.

## Package Information

- **Domain**: `oauth2-proxy.github.io`
- **Name**: `oauth2-proxy`
- **Homepage**: https://oauth2-proxy.github.io/oauth2-proxy/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/oauth2-proxy.github.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install oauth2-proxy.github.io
```

## Programs

This package provides the following executable programs:

- `oauth2-proxy`

## Available Versions

<details>
<summary>Show all 14 versions</summary>

- `7.14.2`, `7.14.1`, `7.14.0`, `7.13.0`, `7.12.0`
- `7.11.0`, `7.10.0`, `7.9.0`, `7.8.2`, `7.8.1`
- `7.8.0`, `7.7.1`, `7.7.0`, `7.6.0`

</details>

**Latest Version**: `7.14.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +oauth2-proxy.github.io@7.14.2 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['oauth2-proxy']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/oauth2-proxy.github.io/package.yml)
- [Homepage](https://oauth2-proxy.github.io/oauth2-proxy/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
