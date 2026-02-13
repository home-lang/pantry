/**
 * **pyproject-build** - A simple, correct Python build frontend
 *
 * @domain `github.com/pypa/build`
 * @programs `pyproject-build`
 * @version `1.4.0` (11 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/pypa/build`
 * @homepage https://build.pypa.io
 * @dependencies `pkgx.sh^1`
 * @buildDependencies `python.org@>=3<3.12` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcompypabuild
 * console.log(pkg.name)        // "pyproject-build"
 * console.log(pkg.description) // "A simple, correct Python build frontend"
 * console.log(pkg.programs)    // ["pyproject-build"]
 * console.log(pkg.versions[0]) // "1.4.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/pypa/build.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const buildPackage = {
  /**
   * The display name of this package.
   */
  name: 'pyproject-build' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/pypa/build' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A simple, correct Python build frontend' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/pypa/build/package.yml' as const,
  homepageUrl: 'https://build.pypa.io' as const,
  githubUrl: 'https://github.com/pypa/build' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/pypa/build' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/pypa/build -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/pypa/build' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'pyproject-build',
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
    'python.org@>=3<3.12',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.4.0',
    '1.3.0',
    '1.2.2',
    '1.2.1',
    '1.2.0',
    '1.1.1',
    '1.1.0',
    '1.0.3',
    '1.0.1',
    '1.0.0',
    '0.10.0',
  ] as const,
  aliases: [] as const,
}

export type BuildPackage = typeof buildPackage
