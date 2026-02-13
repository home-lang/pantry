/**
 * **invoke** - Pythonic task management & command execution.
 *
 * @domain `pyinvoke.org`
 * @programs `invoke`
 * @version `2.2.1` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install pyinvoke.org`
 * @homepage https://www.pyinvoke.org/
 * @dependencies `pkgx.sh^1`
 * @buildDependencies `python.org@^3.13.3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.pyinvokeorg
 * console.log(pkg.name)        // "invoke"
 * console.log(pkg.description) // "Pythonic task management & command execution."
 * console.log(pkg.programs)    // ["invoke"]
 * console.log(pkg.versions[0]) // "2.2.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/pyinvoke-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pyinvokeorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'invoke' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'pyinvoke.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Pythonic task management & command execution.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pyinvoke.org/package.yml' as const,
  homepageUrl: 'https://www.pyinvoke.org/' as const,
  githubUrl: 'https://github.com/pyinvoke/invoke' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install pyinvoke.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pyinvoke.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install pyinvoke.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'invoke',
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
    'python.org@^3.13.3',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.2.1',
    '2.2.0',
    '2.1.4',
  ] as const,
  aliases: [] as const,
}

export type PyinvokeorgPackage = typeof pyinvokeorgPackage
