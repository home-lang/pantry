# systemd

> The systemd System and Service Manager

## Package Information

- **Domain**: `systemd.io`
- **Name**: `systemd`
- **Homepage**: <https://systemd.io>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/systemd.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install systemd.io
```

## Programs

This package provides the following executable programs:

- `busctl`
- `coredumpctl`
- `hostnamectl`
- `journalctl`
- `kernel-install`
- `localectl`
- `loginctl`
- `machinectl`
- `networkctl`
- `oomctl`
- `portablectl`
- `resolvectl`
- `systemctl`
- `systemd-ac-power`
- `systemd-analyze`
- `systemd-ask-password`
- `systemd-cat`
- `systemd-cgls`
- `systemd-cgtop`
- `systemd-confext`
- `systemd-creds`
- `systemd-delta`
- `systemd-detect-virt`
- `systemd-dissect`
- `systemd-escape`
- `systemd-firstboot`
- `systemd-id128`
- `systemd-inhibit`
- `systemd-machine-id-setup`
- `systemd-mount`
- `systemd-notify`
- `systemd-nspawn`
- `systemd-path`
- `systemd-repart`
- `systemd-resolve`
- `systemd-run`
- `systemd-socket-activate`
- `systemd-stdio-bridge`
- `systemd-sysext`
- `systemd-sysusers`
- `systemd-tmpfiles`
- `systemd-tty-ask-password-agent`
- `systemd-umount`
- `timedatectl`
- `udevadm`
- `userdbctl`
- `halt`
- `init`
- `mount.ddi`
- `poweroff`
- `reboot`
- `resolvconf`
- `runlevel`
- `shutdown`
- `telinit`

## Available Versions

<details>
<summary>Show all 31 versions</summary>

- `257.10.0`
- `257.9.0`
- `257.8.0`
- `257.7.0`
- `257.6.0`
- `257.5.0`
- `257.4.0`
- `257.3.0`
- `257.2.0`
- `257.1.0`
- `257.0.0`
- `256.17.0`
- `256.16.0`
- `256.15.0`
- `256.14.0`
- `256.13.0`
- `256.12.0`
- `256.11.0`
- `256.10.0`
- `256.9.0`
- `256.8.0`
- `256.7.0`
- `256.6.0`
- `256.5.0`
- `256.4.0`
- `256.3.0`
- `256.2.0`
- `256.1.0`
- `256.0.0`
- `255.0.0`
- `254.0.0`

</details>

**Latest Version**: `257.10.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +systemd.io@257.10.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `libexpat.github.io`
- `google.com/fullycapable`
- `lz4.org`
- `openssl.org^1.1`
- `github.com/util-linux/util-linux`
- `tukaani.org/xz`
- `facebook.com/zstd`
- `github.com/besser82/libxcrypt`
- `curl.se`
- `gnu.org/libidn2`
- `gnutls.org`
- `sourceware.org/bzip2`
- `pcre.org/v2`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.systemd

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/systemd.io/package.yml)
- [Homepage](https://systemd.io)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
