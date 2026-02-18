# appstreamcli

> Tools and libraries to work with AppStream metadata

## Package Information

- **Domain**: `freedesktop.org/appstream`
- **Name**: `appstreamcli`
- **Homepage**: <https://www.freedesktop.org/wiki/Distributions/AppStream/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/appstream/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install freedesktop.org/appstream
```

## Programs

This package provides the following executable programs:

- `appstreamcli`

## Available Versions

<details>
<summary>Show all 7 versions</summary>

- `1.1.2`, `1.1.1`, `1.1.0`
- `1.0.6`, `1.0.5`, `1.0.4`, `1.0.3`

</details>

**Latest Version**: `1.1.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +freedesktop.org/appstream@1.1.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnome.org/glib@2`
- `github.com/hughsie/libxmlb@0`
- `pyyaml.org/libyaml@0`
- `github.com/pantoniou/libfyaml^0 # since 1.1.0`
- `curl.se@8`
- `gnome.org/libxml2@2`
- `darwin:openldap.org^2 # 1.0.4 needs it with curl`
- `linux:systemd.io`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.appstreamcli

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/appstream/package.yml)
- [Homepage](https://www.freedesktop.org/wiki/Distributions/AppStream/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
