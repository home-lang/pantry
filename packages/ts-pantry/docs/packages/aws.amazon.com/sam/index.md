# sam

> CLI tool to build, test, debug, and deploy Serverless applications using AWS SAM

## Package Information

- **Domain**: `aws.amazon.com/sam`
- **Name**: `sam`
- **Homepage**: https://aws.amazon.com/serverless/sam/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/aws.amazon.com/sam/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install aws.amazon.com/sam
```

## Programs

This package provides the following executable programs:

- `sam`

## Available Versions

<details>
<summary>Show all 46 versions</summary>

- `1.152.0`, `1.151.0`, `1.150.1`, `1.150.0`, `1.149.0`
- `1.148.0`, `1.147.1`, `1.146.0`, `1.145.2`, `1.145.1`
- `1.145.0`, `1.144.0`, `1.143.0`, `1.142.1`, `1.142.0`
- `1.141.0`, `1.140.0`, `1.139.0`, `1.138.0`, `1.137.1`
- `1.137.0`, `1.136.0`, `1.135.0`, `1.134.0`, `1.133.0`
- `1.132.0`, `1.131.0`, `1.130.0`, `1.129.0`, `1.128.0`
- `1.127.0`, `1.126.0`, `1.125.0`, `1.124.0`, `1.123.0`
- `1.122.0`, `1.121.0`, `1.120.0`, `1.119.0`, `1.118.0`
- `1.117.0`, `1.116.0`, `1.115.0`, `1.114.0`, `1.113.0`
- `1.112.0`

</details>

**Latest Version**: `1.152.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +aws.amazon.com/sam@1.152.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `pkgx.sh^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.sam

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/aws.amazon.com/sam/package.yml)
- [Homepage](https://aws.amazon.com/serverless/sam/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
