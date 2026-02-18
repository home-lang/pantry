# gettext

> GNU internationalization (i18n) and localization (l10n) library

## Package Information

- **Domain**: `gnu.org/gettext`
- **Name**: `gettext`
- **Homepage**: <https://www.gnu.org/software/gettext/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/gettext/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnu.org/gettext
```

## Programs

This package provides the following executable programs:

- `autopoint`
- `envsubst`
- `gettext`
- `gettext.sh`
- `gettextize`
- `msgattrib`
- `msgcat`
- `msgcmp`
- `msgcomm`
- `msgconv`
- `msgen`
- `msgexec`
- `msgfilter`
- `msgfmt`
- `msggrep`
- `msginit`
- `msgmerge`
- `msgunfmt`
- `msguniq`
- `ngettext`
- `recode-sr-latin`
- `xgettext`

## Available Versions

<details>
<summary>Show all 8 versions</summary>

- `1.0.0`
- `0.22.5`, `0.22.4`, `0.22.3`, `0.22.2`, `0.22.1`, `0.22.0`
- `0.21.1`

</details>

**Latest Version**: `1.0.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gnu.org/gettext@1.0.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnome.org/libxml2~2.13 # 2.14 changes the API`
- `tukaani.org/xz^5 # autopoint needs this to unpack archives`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.gettext

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/gettext/package.yml)
- [Homepage](https://www.gnu.org/software/gettext/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
