/**
 * **pycparser** - :snake: Complete C99 parser in pure Python
 *
 * @domain `github.com/eliben/pycparser`
 * @version `3.0.0` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/eliben/pycparser`
 * @dependencies `python.org~3.11`
 * @buildDependencies `linux:llvm.org` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomelibenpycparser
 * console.log(pkg.name)        // "pycparser"
 * console.log(pkg.description) // ":snake: Complete C99 parser in pure Python"
 * console.log(pkg.versions[0]) // "3.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/eliben/pycparser.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pycparserPackage = {
  /**
   * The display name of this package.
   */
  name: 'pycparser' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/eliben/pycparser' as const,
  /**
   * Brief description of what this package does.
   */
  description: ':snake: Complete C99 parser in pure Python' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/eliben/pycparser/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/eliben/pycparser' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/eliben/pycparser' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/eliben/pycparser -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/eliben/pycparser' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org~3.11',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'linux:llvm.org',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.0.0',
    '2.23.0',
    '2.22.0',
    '2.21.0',
  ] as const,
  aliases: [] as const,
}

export type PycparserPackage = typeof pycparserPackage
