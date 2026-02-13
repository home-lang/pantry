# talosctl

> CLI for out-of-band management of Kubernetes nodes created by Talos

## Package Information

- **Domain**: `talos.dev`
- **Name**: `talosctl`
- **Homepage**: https://www.talos.dev/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/talos.dev/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install talos.dev
```

## Programs

This package provides the following executable programs:

- `talosctl`

## Available Versions

<details>
<summary>Show all 43 versions</summary>

- `1.12.2`, `1.12.1`, `1.12.0`, `1.11.6`, `1.11.5`
- `1.11.4`, `1.11.3`, `1.11.2`, `1.11.1`, `1.11.0`
- `1.10.9`, `1.10.8`, `1.10.7`, `1.10.6`, `1.10.5`
- `1.10.4`, `1.10.3`, `1.10.2`, `1.10.1`, `1.10.0`
- `1.9.6`, `1.9.5`, `1.9.4`, `1.9.3`, `1.9.2`
- `1.9.1`, `1.9.0`, `1.8.4`, `1.8.3`, `1.8.2`
- `1.8.1`, `1.8.0`, `1.7.7`, `1.7.6`, `1.7.5`
- `1.7.4`, `1.7.3`, `1.7.2`, `1.7.1`, `1.7.0`
- `1.6.8`, `1.6.7`, `1.6.6`

</details>

**Latest Version**: `1.12.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +talos.dev@1.12.2 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.talosctl

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/talos.dev/package.yml)
- [Homepage](https://www.talos.dev/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
