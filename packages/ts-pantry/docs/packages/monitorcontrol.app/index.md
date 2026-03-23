# MonitorControl

> A tool to control external monitor brightness and volume on macOS.

## Package Information

- **Domain**: `monitorcontrol.app`
- **Name**: `MonitorControl`
- **Homepage**: <https://github.com/MonitorControl/MonitorControl>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/monitorcontrol.app/package.yml)

## Installation

```bash
# Install with pantry
pantry install monitorcontrol.app
```

## Programs

This package provides the following executable programs:

- `monitorcontrol`

## Aliases

This package can also be accessed using these aliases:

- `monitorcontrol`
- `monitor-control`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `4.3.0`
- `4.2.0`

</details>

**Latest Version**: `4.3.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +monitorcontrol.app@4.3.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.monitorcontrol

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/monitorcontrol.app/package.yml)
- [Homepage](https://github.com/MonitorControl/MonitorControl)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
