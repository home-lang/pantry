# certbot

> Certbot is EFF's tool to obtain certs from Let's Encrypt and (optionally) auto-enable HTTPS on your server. It can also act as a client for any other CA that uses the ACME protocol.

## Package Information

- **Domain**: `certbot.eff.org`
- **Name**: `certbot`
- **Homepage**: <https://certbot.eff.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/certbot.eff.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install certbot.eff.org
```

## Programs

This package provides the following executable programs:

- `certbot`

## Available Versions

<details>
<summary>Show all 26 versions</summary>

- `5.3.1`, `5.3.0`, `5.2.2`, `5.2.1`, `5.1.0`
- `5.0.0`, `4.2.0`, `4.1.1`, `4.1.0`, `4.0.0`
- `3.3.0`, `3.2.0`, `3.1.0`, `3.0.1`, `3.0.0`
- `2.11.1`, `2.11.0`, `2.10.0`, `2.9.0`, `2.8.0`
- `2.7.4`, `2.7.3`, `2.7.2`, `2.7.1`, `2.7.0`
- `2.6.0`

</details>

**Latest Version**: `5.3.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +certbot.eff.org@5.3.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org~3.11`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.certbot

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/certbot.eff.org/package.yml)
- [Homepage](https://certbot.eff.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
