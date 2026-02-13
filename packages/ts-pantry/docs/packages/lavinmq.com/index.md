# lavinmq

> Lightweight and fast AMQP (0-9-1) server

## Package Information

- **Domain**: `lavinmq.com`
- **Name**: `lavinmq`
- **Homepage**: https://lavinmq.com
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/lavinmq.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install lavinmq.com
```

## Programs

This package provides the following executable programs:

- `lavinmq`
- `lavinmqctl`
- `lavinmqperf`

## Available Versions

<details>
<summary>Show all 24 versions</summary>

- `2.6.4`, `2.6.3`, `2.6.2`, `2.6.1`, `2.6.0`
- `2.5.5`, `2.5.4`, `2.5.3`, `2.5.2`, `2.5.1`
- `2.5.0`, `2.4.5`, `2.4.4`, `2.4.3`, `2.4.2`
- `2.4.1`, `2.4.0`, `2.3.0`, `2.2.0`, `2.1.0`
- `2.0.2`, `2.0.1`, `2.0.0`, `1.3.1`

</details>

**Latest Version**: `2.6.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +lavinmq.com@2.6.4 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1.1`
- `pcre.org/v2@10`
- `libevent.org@2`
- `hboehm.info/gc@8`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.lavinmq

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/lavinmq.com/package.yml)
- [Homepage](https://lavinmq.com)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
