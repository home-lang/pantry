# samtools

> Tools (written in C using htslib) for manipulating next-generation sequencing data

## Package Information

- **Domain**: `htslib.org/samtools`
- **Name**: `samtools`
- **Homepage**: <https://www.htslib.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/htslib.org/samtools/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install htslib.org/samtools
```

## Programs

This package provides the following executable programs:

- `ace2sam`
- `blast2sam.pl`
- `bowtie2sam.pl`
- `export2sam.pl`
- `fasta-sanitize.pl`
- `interpolate_sam.pl`
- `maq2sam-long`
- `maq2sam-short`
- `md5fa`
- `md5sum-lite`
- `novo2sam.pl`
- `plot-ampliconstats`
- `plot-bamstats`
- `psl2sam.pl`
- `sam2vcf.pl`
- `samtools`
- `samtools.pl`
- `seq_cache_populate.pl`
- `soap2sam.pl`
- `wgsim`
- `wgsim_eval.pl`
- `zoom2sam.pl`

## Available Versions

<details>
<summary>Show all 9 versions</summary>

- `1.23.0`
- `1.22.1`, `1.22.0`
- `1.21.0`
- `1.20.0`
- `1.19.2`, `1.19.1`, `1.19.0`
- `1.18.0`

</details>

**Latest Version**: `1.23.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +htslib.org/samtools@1.23.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `htslib.org`
- `invisible-island.net/ncurses`
- `zlib.net@1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.samtools

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/htslib.org/samtools/package.yml)
- [Homepage](https://www.htslib.org/)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
