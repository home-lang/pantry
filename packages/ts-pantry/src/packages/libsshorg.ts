/**
 * **libssh** - pkgx package
 *
 * @domain `libssh.org`
 * @version `0.11.3` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install libssh.org`
 * @dependencies `openssl.org^1.1`, `zlib.net^1`
 * @buildDependencies `cmake.org@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.libsshorg
 * console.log(pkg.name)        // "libssh"
 * console.log(pkg.versions[0]) // "0.11.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/libssh-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libsshorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'libssh' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'libssh.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/libssh.org/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install libssh.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +libssh.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install libssh.org' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openssl.org^1.1',
    'zlib.net^1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org@^3',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.11.3',
    '0.11.2',
    '0.11.1',
    '0.11.0',
    '0.10.6',
    '0.10.5',
    '0.10.4',
    '0.9.8',
    '0.9.7',
  ] as const,
  aliases: [] as const,
}

export type LibsshorgPackage = typeof libsshorgPackage
