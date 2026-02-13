# watchman

> Watches files and records, or triggers actions, when they change.

## Package Information

- **Domain**: `facebook.com/watchman`
- **Name**: `watchman`
- **Homepage**: https://facebook.github.io/watchman/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/facebook.com/watchman/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install facebook.com/watchman
```

## Programs

This package provides the following executable programs:

- `watchman`
- `watchman-diag`
- `watchman-make`
- `watchman-wait`
- `watchman-replicate-subscription`
- `watchmanctl`

## Available Versions

<details>
<summary>Show all 72 versions</summary>

- `2026.1.5.0`, `2026.1.19.0`, `2026.1.12.0`, `2025.4.7.0`, `2025.4.14.0`
- `2025.3.31.0`, `2025.3.3.0`, `2025.3.24.0`, `2025.3.17.0`, `2025.3.10.0`
- `2025.2.3.0`, `2025.2.24.0`, `2025.2.17.0`, `2025.2.10.0`, `2025.12.29.0`
- `2025.12.22.0`, `2025.11.24.0`, `2025.11.17.0`, `2025.11.10.0`, `2025.1.6.0`
- `2025.1.27.0`, `2025.1.20.0`, `2024.9.23.0`, `2024.9.2.0`, `2024.9.16.0`
- `2024.8.5.0`, `2024.8.26.0`, `2024.8.19.0`, `2024.8.12.0`, `2024.7.8.0`
- `2024.7.29.0`, `2024.7.22.0`, `2024.7.15.0`, `2024.7.1.0`, `2024.6.3.0`
- `2024.6.24.0`, `2024.6.10.0`, `2024.5.6.0`, `2024.5.27.0`, `2024.5.20.0`
- `2024.5.2.0`, `2024.5.13.0`, `2024.4.8.0`, `2024.4.29.0`, `2024.4.22.0`
- `2024.4.15.0`, `2024.4.1.0`, `2024.3.4.0`, `2024.3.25.0`, `2024.3.18.0`
- `2024.3.11.0`, `2024.2.5.0`, `2024.2.26.0`, `2024.2.19.0`, `2024.2.12.0`
- `2024.12.9.0`, `2024.12.30.0`, `2024.12.23.0`, `2024.12.2.0`, `2024.12.16.0`
- `2024.11.4.0`, `2024.11.25.0`, `2024.11.18.0`, `2024.11.11.0`, `2024.10.7.0`
- `2024.10.28.0`, `2024.10.21.0`, `2024.10.14.0`, `2024.1.8.0`, `2024.1.29.0`
- `2024.1.22.0`, `2024.1.15.0`

</details>

**Latest Version**: `2026.1.5.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +facebook.com/watchman@2026.1.5.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `facebook.com/edencommon`
- `facebook.com/fb303`
- `facebook.com/folly`
- `fmt.dev>=9`
- `gflags.github.io^2`
- `google.com/glog^0.6`
- `libevent.org^2.1`
- `libsodium.org^1`
- `openssl.org^1.1`
- `pcre.org/v2^10`
- `python.org~3.11`
- `linux:libcxx.llvm.org^18 # libunwind`
- `linux:gnu.org/gcc/libstdcxx@13`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.watchman

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/facebook.com/watchman/package.yml)
- [Homepage](https://facebook.github.io/watchman/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
