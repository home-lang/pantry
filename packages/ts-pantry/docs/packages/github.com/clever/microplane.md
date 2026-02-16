# mp

> A CLI tool to make git changes across many repos, especially useful with Microservices.

## Package Information

- **Domain**: `github.com/clever/microplane`
- **Name**: `mp`
- **Homepage**: https://medium.com/always-a-student/mo-repos-mo-problems-how-we-make-changes-across-many-git-repositories-293ad7d418f0
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/clever/microplane/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/clever/microplane
```

## Programs

This package provides the following executable programs:

- `mp`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `0.0.37`, `0.0.36`, `0.0.35`, `0.0.34`

</details>

**Latest Version**: `0.0.37`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/clever/microplane@0.0.37 -- $SHELL -i
```

## Dependencies

This package depends on:

- `git-scm.org^2`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.mp

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/clever/microplane/package.yml)
- [Homepage](https://medium.com/always-a-student/mo-repos-mo-problems-how-we-make-changes-across-many-git-repositories-293ad7d418f0)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
