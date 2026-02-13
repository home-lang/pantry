/**
 * **flit** - Simplified packaging of Python modules
 *
 * @domain `flit.pypa.io`
 * @programs `flit`
 * @version `3.12.0` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install flit.pypa.io`
 * @homepage https://flit.pypa.io/
 * @dependencies `python.org>=3<3.12`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.flitpypaio
 * console.log(pkg.name)        // "flit"
 * console.log(pkg.description) // "Simplified packaging of Python modules"
 * console.log(pkg.programs)    // ["flit"]
 * console.log(pkg.versions[0]) // "3.12.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/flit-pypa-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const flitpypaioPackage = {
  /**
   * The display name of this package.
   */
  name: 'flit' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'flit.pypa.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Simplified packaging of Python modules' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/flit.pypa.io/package.yml' as const,
  homepageUrl: 'https://flit.pypa.io/' as const,
  githubUrl: 'https://github.com/pypa/flit' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install flit.pypa.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +flit.pypa.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install flit.pypa.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'flit',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org>=3<3.12',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.12.0',
    '3.11.0',
    '3.10.1',
    '3.10.0',
    '3.9.0',
    '3.8.0',
  ] as const,
  aliases: [] as const,
}

export type FlitpypaioPackage = typeof flitpypaioPackage
