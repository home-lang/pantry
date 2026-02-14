# cstool

> Capstone disassembly/disassembler framework for ARM, ARM64 (ARMv8), Alpha, BPF, Ethereum VM, HPPA, LoongArch, M68K, M680X, Mips, MOS65XX, PPC, RISC-V(rv32G/rv64G), SH, Sparc, SystemZ, TMS320C64X, TriCore, Webassembly, XCore and X86.

## Package Information

- **Domain**: `capstone-engine.org`
- **Name**: `cstool`
- **Homepage**: https://www.capstone-engine.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/capstone-engine.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install capstone-engine.org
```

## Programs

This package provides the following executable programs:

- `cstool`

## Available Versions

<details>
<summary>Show all 8 versions</summary>

- `5.0.7`, `5.0.6`, `5.0.5`, `5.0.3`, `5.0.2`
- `5.0.1`, `5.0.0`, `4.0.2`

</details>

**Latest Version**: `5.0.7`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +capstone-engine.org@5.0.7 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.cstool

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/capstone-engine.org/package.yml)
- [Homepage](https://www.capstone-engine.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
