/**
 * **lcov** - Graphical front-end for GCC's coverage testing tool (gcov)
 *
 * @domain `github.com/linux-test-project/lcov`
 * @programs `lcov`, `geninfo`, `genhtml`, `gendesc`, `genpng`
 * @version `2.4.0` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/linux-test-project/lcov`
 * @dependencies `perl.org>=5`, `python.org@3`
 * @buildDependencies `cpanmin.us@^1` - required only when building from source
 * @companions `PERL5LIB^${{prefix}}/lib/perl5`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomlinuxtestprojectlcov
 * console.log(pkg.name)        // "lcov"
 * console.log(pkg.description) // "Graphical front-end for GCC's coverage testing ..."
 * console.log(pkg.programs)    // ["lcov", "geninfo", ...]
 * console.log(pkg.versions[0]) // "2.4.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/linux-test-project/lcov.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const lcovPackage = {
  /**
   * The display name of this package.
   */
  name: 'lcov' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/linux-test-project/lcov' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Graphical front-end for GCC\'s coverage testing tool (gcov)' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/linux-test-project/lcov/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/linux-test-project/lcov' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/linux-test-project/lcov' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/linux-test-project/lcov -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/linux-test-project/lcov' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'lcov',
    'geninfo',
    'genhtml',
    'gendesc',
    'genpng',
  ] as const,
  /**
   * Related packages that work well with this package.
   * Consider installing these for enhanced functionality.
   */
  companions: [
    'PERL5LIB^${{prefix}}/lib/perl5',
  ] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'perl.org>=5',
    'python.org@3',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cpanmin.us@^1',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.4.0',
    '2.3.2',
    '2.3.1',
    '2.3.0',
    '2.2.0',
    '1.16.0',
  ] as const,
  aliases: [] as const,
}

export type LcovPackage = typeof lcovPackage
