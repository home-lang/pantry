# solana

> Web-Scale Blockchain for fast, secure, scalable, decentralized apps and marketplaces.

## Package Information

- **Domain**: `solana.com`
- **Name**: `solana`
- **Homepage**: <https://solana.com>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/solana.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install solana.com
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
<summary>Show all 83 versions</summary>

- `1.18.26`, `1.18.25`, `1.18.23`, `1.18.22`, `1.18.21`
- `1.18.20`, `1.18.18`, `1.18.15`, `1.18.14`, `1.18.13`
- `1.18.12`, `1.18.11`, `1.18.9`, `1.18.8`, `1.18.6`
- `1.18.4`, `1.18.2`, `1.18.1`, `1.17.34`, `1.17.33`
- `1.17.31`, `1.17.28`, `1.17.27`, `1.17.25`, `1.17.22`
- `1.17.20`, `1.17.17`, `1.17.16`, `1.17.15`, `1.17.14`
- `1.17.13`, `1.17.12`, `1.17.11`, `1.17.10`, `1.17.9`
- `1.17.8`, `1.17.7`, `1.17.6`, `1.17.5`, `1.17.4`
- `1.17.3`, `1.17.2`, `1.17.1`, `1.17.0`, `1.16.27`
- `1.16.25`, `1.16.24`, `1.16.23`, `1.16.22`, `1.16.21`
- `1.16.19`, `1.16.18`, `1.16.17`, `1.16.16`, `1.16.15`
- `1.16.14`, `1.16.13`, `1.16.12`, `1.16.11`, `1.16.10`
- `1.16.9`, `1.16.8`, `1.16.7`, `1.16.6`, `1.16.5`
- `1.16.4`, `1.16.3`, `1.16.2`, `1.16.1`, `1.16.0`
- `1.15.2`, `1.14.29`, `1.14.28`, `1.14.27`, `1.14.26`
- `1.14.25`, `1.14.24`, `1.14.23`, `1.14.22`, `1.14.21`
- `1.14.20`, `1.14.19`, `1.14.18`

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

*This documentation was auto-generated from package data.*
