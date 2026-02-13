# bw

> Secure and free password manager for all of your devices

## Package Information

- **Domain**: `bitwarden.com`
- **Name**: `bw`
- **Homepage**: https://bitwarden.com/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/bitwarden.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install bitwarden.com
```

## Programs

This package provides the following executable programs:

- `bw`

## Available Versions

<details>
<summary>Show all 33 versions</summary>

- `2025.12.1`, `2025.12.0`, `2025.11.0`, `2025.10.0`, `2025.9.0`
- `2025.8.0`, `2025.7.0`, `2025.6.1`, `2025.6.0`, `2025.4.0`
- `2025.3.0`, `2025.2.0`, `2025.1.3`, `2025.1.2`, `2025.1.1`
- `2025.1.0`, `2024.12.0`, `2024.11.1`, `2024.11.0`, `2024.10.0`
- `2024.9.0`, `2024.8.2`, `2024.8.1`, `2024.7.2`, `2024.7.1`
- `2024.6.1`, `2024.6.0`, `2024.4.1`, `2024.4.0`, `2024.3.1`
- `2024.2.1`, `2024.2.0`, `1.22.1`

</details>

**Latest Version**: `2025.12.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +bitwarden.com@2025.12.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `nodejs.org^20`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.bw

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/bitwarden.com/package.yml)
- [Homepage](https://bitwarden.com/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
