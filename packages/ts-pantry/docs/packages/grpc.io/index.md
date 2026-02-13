# grpc

> The C based gRPC (C++, Python, Ruby, Objective-C, PHP, C#)

## Package Information

- **Domain**: `grpc.io`
- **Name**: `grpc`
- **Homepage**: https://grpc.io/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/grpc.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install grpc.io
```

## Programs

This package provides the following executable programs:

- `grpc_csharp_plugin`
- `grpc_node_plugin`
- `grpc_cpp_plugin`
- `grpc_python_plugin`
- `grpc_objective_c_plugin`
- `grpc_ruby_plugin`
- `grpc_php_plugin`
- `grpc_cli`

## Available Versions

<details>
<summary>Show all 53 versions</summary>

- `1.76.0`, `1.75.1`, `1.75.0`, `1.74.1`, `1.74.0`
- `1.73.1`, `1.73.0`, `1.72.2`, `1.72.1`, `1.72.0`
- `1.71.2`, `1.71.1`, `1.71.0`, `1.70.2`, `1.70.1`
- `1.70.0`, `1.69.0`, `1.68.2`, `1.68.1`, `1.68.0`
- `1.67.1`, `1.67.0`, `1.66.2`, `1.65.5`, `1.65.4`
- `1.65.3`, `1.65.2`, `1.65.1`, `1.65.0`, `1.64.2`
- `1.64.1`, `1.64.0`, `1.63.1`, `1.62.2`, `1.62.1`
- `1.62.0`, `1.61.2`, `1.61.1`, `1.61.0`, `1.60.1`
- `1.60.0`, `1.59.4`, `1.59.3`, `1.59.2`, `1.59.1`
- `1.59.0`, `1.58.2`, `1.58.1`, `1.58.0`, `1.57.1`
- `1.56.4`, `1.56.3`, `1.55.4`

</details>

**Latest Version**: `1.76.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +grpc.io@1.76.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `abseil.io^20250127`
- `c-ares.org`
- `openssl.org^1.1`
- `github.com/google/re2`
- `zlib.net`
- `linux:gnu.org/gcc/libstdcxx`
- `linux:protobuf.dev^30.0.0 # as of 1.72.0`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.grpc

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/grpc.io/package.yml)
- [Homepage](https://grpc.io/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
