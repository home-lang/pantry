/**
 * **daff** - align and compare tables
 *
 * @domain `paulfitz.github.io/daff`
 * @programs `daff`
 * @version `1.4.2` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install paulfitz.github.io/daff`
 * @homepage https://paulfitz.github.io/daff
 * @dependencies `pkgx.sh^1`
 * @buildDependencies `python.org@>=3.7<3.12`, `pip.pypa.io` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.paulfitzgithubiodaff
 * console.log(pkg.name)        // "daff"
 * console.log(pkg.description) // "align and compare tables"
 * console.log(pkg.programs)    // ["daff"]
 * console.log(pkg.versions[0]) // "1.4.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/paulfitz-github-io/daff.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const paulfitzgithubiodaffPackage = {
  /**
   * The display name of this package.
   */
  name: 'daff' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'paulfitz.github.io/daff' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'align and compare tables' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/paulfitz.github.io/daff/package.yml' as const,
  homepageUrl: 'https://paulfitz.github.io/daff' as const,
  githubUrl: 'https://github.com/paulfitz/daff' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install paulfitz.github.io/daff' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +paulfitz.github.io/daff -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install paulfitz.github.io/daff' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'daff',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'pkgx.sh^1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'python.org@>=3.7<3.12',
    'pip.pypa.io',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.4.2',
    '1.3.46',
  ] as const,
  aliases: [] as const,
}

export type PaulfitzgithubiodaffPackage = typeof paulfitzgithubiodaffPackage
