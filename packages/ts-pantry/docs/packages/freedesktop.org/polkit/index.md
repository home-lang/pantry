# polkit

> polkit (formerly PolicyKit) is a toolkit for defining and handling authorizations. It is used for allowing unprivileged processes to speak to privileged processes.

## Package Information

- **Domain**: `freedesktop.org/polkit`
- **Name**: `polkit`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/polkit/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install freedesktop.org/polkit
```

## Programs

This package provides the following executable programs:

- `pkaction`
- `pkcheck`
- `pkexec`
- `pkttyagent`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `121.0.0`

</details>

**Latest Version**: `121.0.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +freedesktop.org/polkit@121.0.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnome.org/glib^2.78`
- `duktape.org^2.7`
- `gnome.org/gobject-introspection^1.72`
- `freedesktop.org/dbus^1.12`
- `linux-pam.org^1.4`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.polkit

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/polkit/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
