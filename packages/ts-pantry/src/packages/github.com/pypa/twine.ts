/**
 * **twine** - Utilities for interacting with PyPI
 *
 * @domain `github.com/pypa/twine`
 * @programs `twine`
 * @version `6.2.0` (8 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/pypa/twine`
 * @homepage https://twine.readthedocs.io/
 * @dependencies `python.org>=3.7<3.12`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcompypatwine
 * console.log(pkg.name)        // "twine"
 * console.log(pkg.description) // "Utilities for interacting with PyPI"
 * console.log(pkg.programs)    // ["twine"]
 * console.log(pkg.versions[0]) // "6.2.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/pypa/twine.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const twinePackage = {
  /**
   * The display name of this package.
   */
  name: 'twine' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/pypa/twine' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Utilities for interacting with PyPI' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/pypa/twine/package.yml' as const,
  homepageUrl: 'https://twine.readthedocs.io/' as const,
  githubUrl: 'https://github.com/pypa/twine' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/pypa/twine' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/pypa/twine -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/pypa/twine' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'twine',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org>=3.7<3.12',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '6.2.0',
    '6.1.0',
    '6.0.1',
    '6.0.0',
    '5.1.1',
    '5.1.0',
    '5.0.0',
    '4.0.2',
  ] as const,
  aliases: [] as const,
}

export type TwinePackage = typeof twinePackage
