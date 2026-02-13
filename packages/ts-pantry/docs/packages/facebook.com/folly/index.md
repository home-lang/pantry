# folly

> An open-source C++ library developed and used at Facebook.

## Package Information

- **Domain**: `facebook.com/folly`
- **Name**: `folly`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/facebook.com/folly/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install facebook.com/folly
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Available Versions

<details>
<summary>Show all 137 versions</summary>

- `2026.1.5.0`, `2026.1.19.0`, `2026.1.12.0`, `2025.9.8.0`, `2025.9.29.0`
- `2025.9.22.0`, `2025.9.15.0`, `2025.9.1.0`, `2025.8.4.0`, `2025.8.25.0`
- `2025.8.18.0`, `2025.8.11.0`, `2025.7.7.0`, `2025.7.28.0`, `2025.7.21.0`
- `2025.7.14.0`, `2025.6.9.0`, `2025.6.30.0`, `2025.6.23.0`, `2025.6.2.0`
- `2025.6.16.0`, `2025.5.5.0`, `2025.5.26.0`, `2025.5.19.0`, `2025.5.12.0`
- `2025.4.7.0`, `2025.4.28.0`, `2025.4.21.0`, `2025.4.14.0`, `2025.3.31.0`
- `2025.3.3.0`, `2025.3.24.0`, `2025.3.17.0`, `2025.3.10.0`, `2025.2.3.0`
- `2025.2.24.0`, `2025.2.17.0`, `2025.2.10.0`, `2025.12.29.0`, `2025.12.22.0`
- `2025.12.15.0`, `2025.11.3.0`, `2025.11.24.0`, `2025.11.17.0`, `2025.11.10.0`
- `2025.10.6.0`, `2025.10.27.0`, `2025.10.20.0`, `2025.10.13.0`, `2025.1.6.0`
- `2025.1.27.0`, `2025.1.20.0`, `2025.1.13.0`, `2024.9.30.0`, `2024.9.23.0`
- `2024.9.2.0`, `2024.9.16.0`, `2024.8.5.0`, `2024.8.26.0`, `2024.8.19.0`
- `2024.8.12.0`, `2024.7.8.0`, `2024.7.29.0`, `2024.7.22.0`, `2024.7.15.0`
- `2024.7.1.0`, `2024.6.3.0`, `2024.6.24.0`, `2024.6.17.0`, `2024.6.10.0`
- `2024.5.6.0`, `2024.5.27.0`, `2024.5.20.0`, `2024.5.2.0`, `2024.5.13.0`
- `2024.4.8.0`, `2024.4.29.0`, `2024.4.22.0`, `2024.4.15.0`, `2024.4.1.0`
- `2024.3.4.0`, `2024.3.25.0`, `2024.3.18.0`, `2024.3.11.0`, `2024.2.5.0`
- `2024.2.26.0`, `2024.2.19.0`, `2024.2.12.0`, `2024.12.9.0`, `2024.12.30.0`
- `2024.12.23.0`, `2024.12.2.0`, `2024.12.16.0`, `2024.11.4.0`, `2024.11.25.0`
- `2024.11.18.0`, `2024.11.11.0`, `2024.10.7.0`, `2024.10.28.0`, `2024.10.21.0`
- `2024.10.14.0`, `2024.1.8.0`, `2024.1.29.0`, `2024.1.22.0`, `2024.1.15.0`
- `2024.1.1.0`, `2023.9.4.0`, `2023.9.25.0`, `2023.9.18.0`, `2023.9.11.0`
- `2023.8.28.0`, `2023.8.14.0`, `2023.7.3.0`, `2023.7.24.0`, `2023.7.17.0`
- `2023.7.10.0`, `2023.6.8.0`, `2023.6.12.0`, `2023.5.8.0`, `2023.5.22.0`
- `2023.5.15.0`, `2023.5.1.0`, `2023.4.24.0`, `2023.4.10.0`, `2023.12.4.0`
- `2023.12.25.0`, `2023.12.18.0`, `2023.12.11.0`, `2023.11.6.0`, `2023.11.27.0`
- `2023.11.20.0`, `2023.11.13.0`, `2023.10.9.0`, `2023.10.30.0`, `2023.10.23.0`
- `2023.10.2.0`, `2023.10.16.0`

</details>

**Latest Version**: `2026.1.5.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +facebook.com/folly@2026.1.5.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `boost.org<1.89 # doesn`
- `gflags.github.io~2.2 # looking for glog`
- `google.com/glog<0.7`
- `libevent.org`
- `lz4.org@1`
- `openssl.org^1.1`
- `tukaani.org/xz@5`
- `facebook.com/zstd@1`
- `gnu.org/coreutils@9`
- `google.github.io/snappy`
- `google.com/double-conversion^3`
- `google.com/googletest^1`
- `fmt.dev^12`
- `zlib.net^1`
- `github.com/fastfloat/fast_float@7`
- `darwin:sourceware.org/bzip2`
- `linux:libcxx.llvm.org^18 # libunwind, since 2024.5.13.0`
- `linux:jemalloc.net^5 # since 2024.5.13.0`
- `linux:elfutils.org^0 # for dwarf.h, since 2024.5.13.0`
- `linux:gnu.org/gcc/libstdcxx@13`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.folly

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/facebook.com/folly/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
