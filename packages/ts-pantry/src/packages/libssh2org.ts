/**
 * **libssh2** - the SSH library
 *
 * @domain `libssh2.org`
 * @version `1.11.1` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install libssh2.org`
 * @homepage https://libssh2.org/
 * @dependencies `openssl.org^1.1`, `zlib.net^1.2`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.libssh2org
 * console.log(pkg.name)        // "libssh2"
 * console.log(pkg.description) // "the SSH library"
 * console.log(pkg.versions[0]) // "1.11.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/libssh2-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libssh2orgPackage = {
  /**
   * The display name of this package.
   */
  name: 'libssh2' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'libssh2.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'the SSH library' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/libssh2.org/package.yml' as const,
  homepageUrl: 'https://libssh2.org/' as const,
  githubUrl: 'https://github.com/libssh2/libssh2' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install libssh2.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +libssh2.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install libssh2.org' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openssl.org^1.1',
    'zlib.net^1.2',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.11.1',
    '1.11.0',
    '1.10.0',
  ] as const,
  aliases: [] as const,
}

export type Libssh2orgPackage = typeof libssh2orgPackage
