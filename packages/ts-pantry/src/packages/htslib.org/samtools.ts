/**
 * **samtools** - Tools (written in C using htslib) for manipulating next-generation sequencing data
 *
 * @domain `htslib.org/samtools`
 * @programs `ace2sam`, `blast2sam.pl`, `bowtie2sam.pl`, `export2sam.pl`, `fasta-sanitize.pl`, ... (+17 more)
 * @version `1.23.0` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install htslib.org/samtools`
 * @homepage https://www.htslib.org/
 * @dependencies `htslib.org`, `invisible-island.net/ncurses`, `zlib.net@1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.htsliborgsamtools
 * console.log(pkg.name)        // "samtools"
 * console.log(pkg.description) // "Tools (written in C using htslib) for manipulat..."
 * console.log(pkg.programs)    // ["ace2sam", "blast2sam.pl", ...]
 * console.log(pkg.versions[0]) // "1.23.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/htslib-org/samtools.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const htsliborgsamtoolsPackage = {
  /**
  * The display name of this package.
  */
  name: 'samtools' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'htslib.org/samtools' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Tools (written in C using htslib) for manipulating next-generation sequencing data' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/htslib.org/samtools/package.yml' as const,
  homepageUrl: 'https://www.htslib.org/' as const,
  githubUrl: 'https://github.com/samtools/samtools' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install htslib.org/samtools' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +htslib.org/samtools -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install htslib.org/samtools' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'ace2sam',
    'blast2sam.pl',
    'bowtie2sam.pl',
    'export2sam.pl',
    'fasta-sanitize.pl',
    'interpolate_sam.pl',
    'maq2sam-long',
    'maq2sam-short',
    'md5fa',
    'md5sum-lite',
    'novo2sam.pl',
    'plot-ampliconstats',
    'plot-bamstats',
    'psl2sam.pl',
    'sam2vcf.pl',
    'samtools',
    'samtools.pl',
    'seq_cache_populate.pl',
    'soap2sam.pl',
    'wgsim',
    'wgsim_eval.pl',
    'zoom2sam.pl',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'htslib.org',
    'invisible-island.net/ncurses',
    'zlib.net@1',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.23.0',
    '1.22.1',
    '1.22.0',
    '1.21.0',
    '1.20.0',
    '1.19.2',
    '1.19.1',
    '1.19.0',
    '1.18.0',
  ] as const,
  aliases: [] as const,
}

export type HtsliborgsamtoolsPackage = typeof htsliborgsamtoolsPackage
