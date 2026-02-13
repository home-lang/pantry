/**
 * **hatch** - Modern, extensible Python project management
 *
 * @domain `hatch.pypa.io`
 * @programs `hatch`
 * @version `1.16.3` (25 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install hatch.pypa.io`
 * @homepage https://hatch.pypa.io/latest/
 * @dependencies `python.org>=3<3.12`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.hatchpypaio
 * console.log(pkg.name)        // "hatch"
 * console.log(pkg.description) // "Modern, extensible Python project management"
 * console.log(pkg.programs)    // ["hatch"]
 * console.log(pkg.versions[0]) // "1.16.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/hatch-pypa-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const hatchpypaioPackage = {
  /**
   * The display name of this package.
   */
  name: 'hatch' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'hatch.pypa.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Modern, extensible Python project management' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/hatch.pypa.io/package.yml' as const,
  homepageUrl: 'https://hatch.pypa.io/latest/' as const,
  githubUrl: 'https://github.com/pypa/hatch' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install hatch.pypa.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +hatch.pypa.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install hatch.pypa.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'hatch',
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
    '1.16.3',
    '1.16.2',
    '1.16.1',
    '1.16.0',
    '1.15.1',
    '1.15.0',
    '1.14.2',
    '1.14.1',
    '1.14.0',
    '1.13.0',
    '1.12.0',
    '1.11.1',
    '1.11.0',
    '1.10.0',
    '1.9.7',
    '1.9.6',
    '1.9.5',
    '1.9.4',
    '1.9.3',
    '1.9.2',
    '1.9.1',
    '1.9.0',
    '1.8.1',
    '1.8.0',
    '1.7.0',
  ] as const,
  aliases: [] as const,
}

export type HatchpypaioPackage = typeof hatchpypaioPackage
