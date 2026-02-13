/**
 * **parallel** - Shell command parallelization utility
 *
 * @domain `gnu.org/parallel`
 * @programs `env_parallel`, `niceload`, `parallel`, `parcat`, `parset`, ... (+3 more)
 * @version `20251222.0.0` (24 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/parallel`
 * @homepage https://savannah.gnu.org/projects/parallel/
 * @dependencies `perl.org@5`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorgparallel
 * console.log(pkg.name)        // "parallel"
 * console.log(pkg.description) // "Shell command parallelization utility"
 * console.log(pkg.programs)    // ["env_parallel", "niceload", ...]
 * console.log(pkg.versions[0]) // "20251222.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/parallel.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorgparallelPackage = {
  /**
   * The display name of this package.
   */
  name: 'parallel' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gnu.org/parallel' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Shell command parallelization utility' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/parallel/package.yml' as const,
  homepageUrl: 'https://savannah.gnu.org/projects/parallel/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gnu.org/parallel' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/parallel -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/parallel' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'env_parallel',
    'niceload',
    'parallel',
    'parcat',
    'parset',
    'parsort',
    'sem',
    'sql',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'perl.org@5',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '20251222.0.0',
    '20251122.0.0',
    '20251022.0.0',
    '20250922.0.0',
    '20250822.0.0',
    '20250722.0.0',
    '20250622.0.0',
    '20250522.0.0',
    '20250422.0.0',
    '20250322.0.0',
    '20250222.0.0',
    '20250122.0.0',
    '20241222.0.0',
    '20241122.0.0',
    '20241022.0.0',
    '20240922.0.0',
    '20240822.0.0',
    '20240722.0.0',
    '20240622.0.0',
    '20240522.0.0',
    '20240422.0.0',
    '20240322.0.0',
    '20240222.0.0',
    '20240122.0.0',
  ] as const,
  aliases: [] as const,
}

export type GnuorgparallelPackage = typeof gnuorgparallelPackage
