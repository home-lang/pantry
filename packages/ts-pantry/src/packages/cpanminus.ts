/**
 * **cpanm** - cpanminus - get, unpack, build and install modules from CPAN
 *
 * @domain `cpanmin.us`
 * @programs `cpanm`
 * @version `1.7048.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install cpanmin.us`
 * @homepage http://cpanmin.us
 * @dependencies `perl.org`
 * @buildDependencies `linux:gnu.org/make` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cpanminus
 * console.log(pkg.name)        // "cpanm"
 * console.log(pkg.description) // "cpanminus - get, unpack, build and install modu..."
 * console.log(pkg.programs)    // ["cpanm"]
 * console.log(pkg.versions[0]) // "1.7048.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/cpanmin-us.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cpanminusPackage = {
  /**
   * The display name of this package.
   */
  name: 'cpanm' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'cpanmin.us' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'cpanminus - get, unpack, build and install modules from CPAN ' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/cpanmin.us/package.yml' as const,
  homepageUrl: 'http://cpanmin.us' as const,
  githubUrl: 'https://github.com/miyagawa/cpanminus' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install cpanmin.us' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +cpanmin.us -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install cpanmin.us' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'cpanm',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'perl.org',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'linux:gnu.org/make',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.7048.0',
    '1.7047.0',
    '1.7046.0',
  ] as const,
  aliases: [] as const,
}

export type CpanminusPackage = typeof cpanminusPackage
