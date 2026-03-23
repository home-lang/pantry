# solana

> Web-Scale Blockchain for fast, secure, scalable, decentralized apps and marketplaces.

## Package Information

- **Domain**: `solana.com`
- **Name**: `solana`
- **Homepage**: <https://solana.com>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/solana.com/package.yml)

## Installation

```bash
# Install with pantry
pantry install solana.com
```

## Programs

This package provides the following executable programs:

- `solana`
- `solana-keygen`
- `solana-bench-streamer`
- `solana-faucet`
- `solana-keygen`
- `solana-log-analyzer`
- `solana-net-shaper`
- `solana-stake-accounts`
- `solana-tokens`
- `solana-watchtower`

## Available Versions

<details>
<summary>Show all 20 versions</summary>

- `1.18.26`, `1.18.25`, `1.18.23`, `1.18.22`, `1.18.21`, `1.18.20`, `1.18.18`, `1.18.15`, `1.18.14`, `1.18.13`, `1.18.12`, `1.18.11`, `1.18.9`, `1.18.8`, `1.18.7`, `1.18.6`, `1.18.5`, `1.18.4`, `1.18.2`, `1.18.1`

</details>

**Latest Version**: `1.18.26`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +solana.com@1.18.26 -- $SHELL -i
```

## Dependencies

This package depends on:

- `protobuf.dev^21`
- `zlib.net^1.2`
- `openssl.org^1.1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.solana

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/solana.com/package.yml)
- [Homepage](https://solana.com)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
