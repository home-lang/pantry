/**
 * **bc** - pkgx package
 *
 * @domain `gnu.org/bc`
 * @programs `bc`, `dc`
 * @version `1.8.2` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/bc`
 * @dependencies `github.com/westes/flex^2.6`
 * @buildDependencies `gnu.org/bison`, `gnu.org/ed`, `linux:gnu.org/texinfo` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorgbc
 * console.log(pkg.name)        // "bc"
 * console.log(pkg.programs)    // ["bc", "dc"]
 * console.log(pkg.versions[0]) // "1.8.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/bc.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorgbcPackage = {
  /**
  * The display name of this package.
  */
  name: 'bc' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gnu.org/bc' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/bc/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install gnu.org/bc' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/bc -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/bc' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'bc',
    'dc',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'github.com/westes/flex^2.6',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'gnu.org/bison',
    'gnu.org/ed',
    'linux:gnu.org/texinfo',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.8.2',
    '1.8.1',
    '1.8.0',
    '1.7.1',
  ] as const,
  aliases: [] as const,
}

export type GnuorgbcPackage = typeof gnuorgbcPackage
