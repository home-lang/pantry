/**
 * **getmonero** - pkgx package
 *
 * @domain `getmonero.org`
 * @version `0.18.4.5` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install getmonero.org`
 * @dependencies `boost.org^1.66`, `openssl.org^1.1`, `libsodium.org`, ... (+3 more)
 * @buildDependencies `cmake.org@^3`, `linux:llvm.org@20` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.getmoneroorg
 * console.log(pkg.name)        // "getmonero"
 * console.log(pkg.versions[0]) // "0.18.4.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/getmonero-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const getmoneroorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'getmonero' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'getmonero.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/getmonero.org/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install getmonero.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +getmonero.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install getmonero.org' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'boost.org^1.66',
    'openssl.org^1.1',
    'libsodium.org',
    'gnu.org/readline',
    'unbound.net^1.4',
    'zeromq.org^4.2',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'cmake.org@^3',
    'linux:llvm.org@20',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.18.4.5',
    '0.18.4.4',
    '0.18.4.3',
    '0.18.4.2',
    '0.18.4.1',
  ] as const,
  aliases: [] as const,
}

export type GetmoneroorgPackage = typeof getmoneroorgPackage
