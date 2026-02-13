# dotnet

> Home of .NET's Virtual Monolithic Repository which includes all the code needed to build the .NET SDK from source

## Package Information

- **Domain**: `dotnet.microsoft.com`
- **Name**: `dotnet`
- **Homepage**: https://dotnet.microsoft.com/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/dotnet.microsoft.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install dotnet.microsoft.com
```

## Programs

This package provides the following executable programs:

- `dotnet`

## Available Versions

<details>
<summary>Show all 45 versions</summary>

- `10.0.102`, `10.0.101`, `9.0.310`, `9.0.309`, `9.0.308`
- `9.0.306`, `9.0.303`, `9.0.202`, `9.0.113`, `9.0.111`
- `9.0.102`, `9.0.100`, `8.0.417`, `8.0.415`, `8.0.410`
- `8.0.405`, `8.0.403`, `8.0.402`, `8.0.401`, `8.0.318`
- `8.0.313`, `8.0.308`, `8.0.303`, `8.0.302`, `8.0.301`
- `8.0.206`, `8.0.204`, `8.0.203`, `8.0.121`, `8.0.112`
- `8.0.107`, `8.0.106`, `8.0.104`, `8.0.101`, `8.0.100`
- `7.0.404`, `7.0.306`, `7.0.120`, `6.0.424`, `6.0.423`
- `6.0.422`, `6.0.417`, `6.0.132`, `6.0.131`, `6.0.130`

</details>

**Latest Version**: `10.0.102`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +dotnet.microsoft.com@10.0.102 -- $SHELL -i
```

## Dependencies

This package depends on:

- `linux:unicode.org^71`
- `linux:openssl.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.dotnet

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/dotnet.microsoft.com/package.yml)
- [Homepage](https://dotnet.microsoft.com/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
