/**
 * **distlib** - A low-level library which implements some Python packaging  standards (PEPs) and which could be used by third-party packaging tools to achieve interoperability.
 *
 * @domain `pypa.io/distlib`
 * @version `0.3.6` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install pypa.io/distlib`
 * @homepage http://distlib.readthedocs.io/
 * @dependencies `python.org>=3.11`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.pypaiodistlib
 * console.log(pkg.name)        // "distlib"
 * console.log(pkg.description) // "A low-level library which implements some Pytho..."
 * console.log(pkg.versions[0]) // "0.3.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/pypa-io/distlib.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pypaiodistlibPackage = {
  /**
   * The display name of this package.
   */
  name: 'distlib' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'pypa.io/distlib' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A low-level library which implements some Python packaging  standards (PEPs) and which could be used by third-party packaging tools to achieve interoperability.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pypa.io/distlib/package.yml' as const,
  homepageUrl: 'http://distlib.readthedocs.io/' as const,
  githubUrl: 'https://github.com/pypa/distlib' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install pypa.io/distlib' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pypa.io/distlib -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install pypa.io/distlib' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org>=3.11',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.3.6',
  ] as const,
  aliases: [] as const,
}

export type PypaiodistlibPackage = typeof pypaiodistlibPackage
