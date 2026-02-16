# jags

> Just Another Gibbs Sampler for Bayesian MCMC simulation

## Package Information

- **Domain**: `mcmc-jags.sourceforge.io`
- **Name**: `jags`
- **Homepage**: <https://mcmc-jags.sourceforge.io>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/mcmc-jags.sourceforge.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install mcmc-jags.sourceforge.io
```

## Programs

This package provides the following executable programs:

- `jags`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `4.3.2`

</details>

**Latest Version**: `4.3.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +mcmc-jags.sourceforge.io@4.3.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnu.org/gcc`
- `linux:netlib.org/lapack^3`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.jags

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/mcmc-jags.sourceforge.io/package.yml)
- [Homepage](https://mcmc-jags.sourceforge.io)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
