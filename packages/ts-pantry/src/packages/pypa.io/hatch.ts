/**
 * **hatch** - Modern, extensible Python project management
 *
 * @domain `pypa.io/hatch`
 * @programs `hatch`, `hatchling`
 * @version `1.28.0` (18 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install pypa.io/hatch`
 * @homepage https://hatch.pypa.io/latest/
 * @dependencies `pkgx.sh^1`
 * @buildDependencies `python.org@~3.12` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.pypaiohatch
 * console.log(pkg.name)        // "hatch"
 * console.log(pkg.description) // "Modern, extensible Python project management"
 * console.log(pkg.programs)    // ["hatch", "hatchling"]
 * console.log(pkg.versions[0]) // "1.28.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/pypa-io/hatch.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pypaiohatchPackage = {
  /**
   * The display name of this package.
   */
  name: 'hatch' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'pypa.io/hatch' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Modern, extensible Python project management' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pypa.io/hatch/package.yml' as const,
  homepageUrl: 'https://hatch.pypa.io/latest/' as const,
  githubUrl: 'https://github.com/pypa/hatch' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install pypa.io/hatch' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pypa.io/hatch -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install pypa.io/hatch' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'hatch',
    'hatchling',
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
    'python.org@~3.12',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.28.0',
    '1.27.0',
    '1.26.3',
    '1.26.2',
    '1.26.1',
    '1.26.0',
    '1.25.0',
    '1.24.2',
    '1.24.1',
    '1.24.0',
    '1.23.0',
    '1.22.5',
    '1.22.4',
    '1.22.3',
    '1.22.2',
    '1.22.1',
    '1.22.0',
    '1.21.1',
  ] as const,
  aliases: [] as const,
}

export type PypaiohatchPackage = typeof pypaiohatchPackage
