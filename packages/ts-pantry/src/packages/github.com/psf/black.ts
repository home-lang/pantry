/**
 * **black** - The uncompromising Python code formatter
 *
 * @domain `github.com/psf/black`
 * @programs `black`, `blackd`
 * @version `26.1.0` (23 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/psf/black`
 * @homepage https://black.readthedocs.io/en/stable/
 * @dependencies `pkgx.sh>=1`
 * @buildDependencies `python.org@>=3.7<3.12` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcompsfblack
 * console.log(pkg.name)        // "black"
 * console.log(pkg.description) // "The uncompromising Python code formatter"
 * console.log(pkg.programs)    // ["black", "blackd"]
 * console.log(pkg.versions[0]) // "26.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/psf/black.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const blackPackage = {
  /**
   * The display name of this package.
   */
  name: 'black' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/psf/black' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'The uncompromising Python code formatter' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/psf/black/package.yml' as const,
  homepageUrl: 'https://black.readthedocs.io/en/stable/' as const,
  githubUrl: 'https://github.com/psf/black' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/psf/black' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/psf/black -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/psf/black' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'black',
    'blackd',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'pkgx.sh>=1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'python.org@>=3.7<3.12',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '26.1.0',
    '25.12.0',
    '25.11.0',
    '25.9.0',
    '25.1.0',
    '24.10.0',
    '24.8.0',
    '24.4.2',
    '24.4.1',
    '24.4.0',
    '24.3.0',
    '24.2.0',
    '24.1.1',
    '24.1.0',
    '23.12.1',
    '23.12.0',
    '23.11.0',
    '23.10.1',
    '23.10.0',
    '23.9.1',
    '23.9.0',
    '23.7.0',
    '23.3.0',
  ] as const,
  aliases: [] as const,
}

export type BlackPackage = typeof blackPackage
