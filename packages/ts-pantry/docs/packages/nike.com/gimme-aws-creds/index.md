# gimme-aws-creds

> A CLI that utilizes Okta IdP via SAML to acquire temporary AWS credentials

## Package Information

- **Domain**: `nike.com/gimme-aws-creds`
- **Name**: `gimme-aws-creds`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/nike.com/gimme-aws-creds/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install nike.com/gimme-aws-creds
```

## Programs

This package provides the following executable programs:

- `gimme-aws-creds`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `2.8.2`, `2.8.1.1`, `2.8.1`, `2.8.0`

</details>

**Latest Version**: `2.8.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +nike.com/gimme-aws-creds@2.8.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `pkgx.sh^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['gimme-aws-creds']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/nike.com/gimme-aws-creds/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
