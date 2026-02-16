# dbus

> Message bus system, providing inter-application communication

## Package Information

- **Domain**: `freedesktop.org/dbus`
- **Name**: `dbus`
- **Homepage**: <https://wiki.freedesktop.org/www/Software/dbus>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/dbus/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install freedesktop.org/dbus
```

## Programs

This package provides the following executable programs:

- `dbus-cleanup-sockets`
- `dbus-daemon`
- `dbus-launch`
- `dbus-monitor`
- `dbus-run-session`
- `dbus-send`
- `dbus-test-tool`
- `dbus-update-activation-environment`
- `dbus-uuidgen`

## Available Versions

<details>
<summary>Show all 7 versions</summary>

- `1.16.2`, `1.16.0`, `1.15.92`, `1.15.90`, `1.15.12`
- `1.15.10`, `1.15.8`

</details>

**Latest Version**: `1.16.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +freedesktop.org/dbus@1.16.2 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.dbus

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/dbus/package.yml)
- [Homepage](https://wiki.freedesktop.org/www/Software/dbus)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
