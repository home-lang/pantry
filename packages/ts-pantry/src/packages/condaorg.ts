/**
 * **conda** - pkgx package
 *
 * @domain `conda.org`
 * @programs `conda`
 * @version `25.11.1` (19 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install conda.org`
 * @dependencies `pkgx.sh^1`, `openssl.org^1.1`
 * @buildDependencies `python.org@=3.11.5`, `gnu.org/patch`, `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.condaorg
 * console.log(pkg.name)        // "conda"
 * console.log(pkg.programs)    // ["conda"]
 * console.log(pkg.versions[0]) // "25.11.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/conda-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const condaorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'conda' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'conda.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/conda.org/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install conda.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +conda.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install conda.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'conda',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'pkgx.sh^1',
    'openssl.org^1.1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'python.org@=3.11.5',
    'gnu.org/patch',
    'curl.se',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '25.11.1',
    '25.9.1',
    '25.7.0',
    '25.5.1',
    '25.3.1',
    '25.1.1',
    '24.11.1',
    '24.9.2',
    '24.7.1',
    '24.5.0',
    '24.4.0',
    '24.3.0',
    '24.1.2',
    '23.11.0',
    '23.10.0',
    '23.9.0',
    '23.7.4',
    '23.7.3',
    '23.7.2',
  ] as const,
  aliases: [] as const,
}

export type CondaorgPackage = typeof condaorgPackage
