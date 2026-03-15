# grub

> GNU GRand Unified Bootloader

## Package Information

- **Domain**: `gnu.org/grub`
- **Name**: `grub`
- **Homepage**: <https://www.gnu.org/software/grub/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/grub/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnu.org/grub
```

## Programs

This package provides the following executable programs:

- `grub-bios-setup`
- `grub-editenv`
- `grub-file`
- `grub-fstest`
- `grub-install`
- `grub-kbdcomp`
- `grub-menulst2cfg`
- `grub-mkconfig`
- `grub-mkimage`
- `grub-mklayout`
- `grub-mknetdir`
- `grub-mkpasswd-pbkdf2`
- `grub-mkrelpath`
- `grub-mkrescue`
- `grub-mkstandalone`
- `grub-mount`
- `grub-probe`
- `grub-reboot`
- `grub-render-label`
- `grub-script-check`
- `grub-set-default`
- `grub-syslinux2cfg`

## Available Versions

<details>
<summary>Show all 7 versions</summary>

- `2.14.0`
- `2.12.0`
- `2.6.0`
- `2.4.0`
- `2.2.0`
- `2.0.0`
- `1.99.0`

</details>

**Latest Version**: `2.14.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gnu.org/grub@2.14.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnu.org/gettext`
- `sourceware.org/bzip2`
- `tukaani.org/xz`
- `zlib.net`
- `gnupg.org/libgcrypt`
- `gnu.org/libunistring`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.grub

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/grub/package.yml)
- [Homepage](https://www.gnu.org/software/grub/)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
