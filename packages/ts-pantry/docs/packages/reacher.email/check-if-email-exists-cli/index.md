# check_if_email_exists

> Check if an email address exists without sending any email, written in Rust. Comes with a ⚙️ HTTP backend.

## Package Information

- **Domain**: `reacher.email/check-if-email-exists-cli`
- **Name**: `check_if_email_exists`
- **Homepage**: https://reacher.email
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/reacher.email/check-if-email-exists-cli/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install reacher.email/check-if-email-exists-cli
```

## Programs

This package provides the following executable programs:

- `check_if_email_exists`

## Available Versions

<details>
<summary>Show all 12 versions</summary>

- `0.11.7`, `0.11.6`, `0.11.5`, `0.11.4`, `0.11.3`
- `0.11.2`, `0.11.1`, `0.11.0`, `0.10.1`, `0.10.0`
- `0.9.1`, `0.9.0`

</details>

**Latest Version**: `0.11.7`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +reacher.email/check-if-email-exists-cli@0.11.7 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1.1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.check_if_email_exists

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/reacher.email/check-if-email-exists-cli/package.yml)
- [Homepage](https://reacher.email)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
