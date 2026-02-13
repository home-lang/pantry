/**
 * **neon-config** - neon - an HTTP/1.1 and WebDAV client library with a C API
 *
 * @domain `notroj.github.io/neon`
 * @programs `neon-config`
 * @version `0.36.0` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install notroj.github.io/neon`
 * @homepage https://notroj.github.io/neon/
 * @dependencies `openssl.org`
 * @buildDependencies `gnu.org/make`, `pagure.io/xmlto` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.notrojgithubioneon
 * console.log(pkg.name)        // "neon-config"
 * console.log(pkg.description) // "neon - an HTTP/1.1 and WebDAV client library wi..."
 * console.log(pkg.programs)    // ["neon-config"]
 * console.log(pkg.versions[0]) // "0.36.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/notroj-github-io/neon.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const notrojgithubioneonPackage = {
  /**
   * The display name of this package.
   */
  name: 'neon-config' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'notroj.github.io/neon' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'neon - an HTTP/1.1 and WebDAV client library with a C API' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/notroj.github.io/neon/package.yml' as const,
  homepageUrl: 'https://notroj.github.io/neon/' as const,
  githubUrl: 'https://github.com/notroj/neon' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install notroj.github.io/neon' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +notroj.github.io/neon -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install notroj.github.io/neon' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'neon-config',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openssl.org',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/make',
    'pagure.io/xmlto',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.36.0',
    '0.35.0',
    '0.34.2',
    '0.34.1',
    '0.34.0',
    '0.33.0',
    '0.32.5',
  ] as const,
  aliases: [] as const,
}

export type NotrojgithubioneonPackage = typeof notrojgithubioneonPackage
