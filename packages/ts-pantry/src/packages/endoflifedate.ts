/**
 * **eol** - CLI to show end-of-life dates for a number of products.
 *
 * @domain `endoflife.date`
 * @programs `eol`
 * @version `0.24.1` (12 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install endoflife.date`
 * @homepage https://endoflife.date
 * @dependencies `python.org^3.12`
 * @buildDependencies `linux:llvm.org` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.endoflifedate
 * console.log(pkg.name)        // "eol"
 * console.log(pkg.description) // "CLI to show end-of-life dates for a number of p..."
 * console.log(pkg.programs)    // ["eol"]
 * console.log(pkg.versions[0]) // "0.24.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/endoflife-date.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const endoflifedatePackage = {
  /**
   * The display name of this package.
   */
  name: 'eol' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'endoflife.date' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'CLI to show end-of-life dates for a number of products.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/endoflife.date/package.yml' as const,
  homepageUrl: 'https://endoflife.date' as const,
  githubUrl: 'https://github.com/hugovk/norwegianblue' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install endoflife.date' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +endoflife.date -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install endoflife.date' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'eol',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org^3.12',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'linux:llvm.org',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.24.1',
    '0.24.0',
    '0.23.0',
    '0.22.0',
    '0.21.0',
    '0.20.0',
    '0.19.0',
    '0.18.0',
    '0.17.0',
    '0.16.0',
    '0.15.0',
    '0.14.0',
  ] as const,
  aliases: [] as const,
}

export type EndoflifedatePackage = typeof endoflifedatePackage
