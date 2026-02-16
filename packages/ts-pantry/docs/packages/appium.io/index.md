# appium

> Cross-platform automation framework for all kinds of apps, built on top of the W3C WebDriver protocol

## Package Information

- **Domain**: `appium.io`
- **Name**: `appium`
- **Homepage**: https://appium.io/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/appium.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install appium.io
```

## Programs

This package provides the following executable programs:

- `appium`

## Available Versions

<details>
<summary>Show all 39 versions</summary>

- `3.0.2`, `3.0.1`, `2.19.0`, `2.18.0`, `2.17.1`
- `2.17.0`, `2.16.2`, `2.16.1`, `2.16.0`, `2.15.0`
- `2.14.1`, `2.14.0`, `2.13.1`, `2.13.0`, `2.12.2`
- `2.12.1`, `2.12.0`, `2.11.5`, `2.11.4`, `2.11.3`
- `2.11.2`, `2.11.1`, `2.11.0`, `2.10.3`, `2.10.2`
- `2.10.1`, `2.9.0`, `2.8.0`, `2.7.0`, `2.6.0`
- `2.5.4`, `2.5.3`, `2.5.2`, `2.5.1`, `2.5.0`
- `2.4.1`, `2.4.0`, `2.3.0`, `2.2.3`

</details>

**Latest Version**: `3.0.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +appium.io@3.0.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `npmjs.com`
- `nodejs.org^10.13.0 || ^12 || ^14 || ^16 || ^18 || ^20`
- `openjdk.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.appium

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/appium.io/package.yml)
- [Homepage](https://appium.io/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
