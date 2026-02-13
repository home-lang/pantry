# sentry-cli

> Command-line utility to interact with Sentry

## Package Information

- **Domain**: `sentry.io`
- **Name**: `sentry-cli`
- **Homepage**: https://docs.sentry.io/cli/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/sentry.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install sentry.io
```

## Programs

This package provides the following executable programs:

- `sentry-cli`

## Available Versions

<details>
<summary>Show all 71 versions</summary>

- `3.1.0`, `3.0.3`, `3.0.2`, `3.0.1`, `3.0.0`
- `2.58.4`, `2.58.3`, `2.58.2`, `2.58.1`, `2.58.0`
- `2.57.0`, `2.56.1`, `2.56.0`, `2.55.0`, `2.54.0`
- `2.53.0`, `2.52.0`, `2.51.1`, `2.51.0`, `2.50.2`
- `2.50.1`, `2.50.0`, `2.49.0`, `2.48.0`, `2.47.1`
- `2.47.0`, `2.46.0`, `2.45.0`, `2.44.0`, `2.43.1`
- `2.43.0`, `2.42.5`, `2.42.4`, `2.42.3`, `2.42.2`
- `2.42.1`, `2.42.0`, `2.41.1`, `2.41.0`, `2.40.0`
- `2.39.1`, `2.39.0`, `2.38.2`, `2.38.1`, `2.38.0`
- `2.37.0`, `2.36.6`, `2.36.5`, `2.36.4`, `2.36.3`
- `2.36.2`, `2.36.1`, `2.36.0`, `2.35.0`, `2.34.1`
- `2.34.0`, `2.33.1`, `2.33.0`, `2.32.2`, `2.32.1`
- `2.32.0`, `2.31.2`, `2.31.1`, `2.31.0`, `2.30.5`
- `2.30.4`, `2.30.3`, `2.30.2`, `2.30.1`, `2.30.0`
- `2.29.1`

</details>

**Latest Version**: `3.1.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +sentry.io@3.1.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `libgit2.org~1.7 # links to libgit2.so.1.7`
- `curl.se^8 # links to libcurl`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['sentry-cli']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/sentry.io/package.yml)
- [Homepage](https://docs.sentry.io/cli/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
