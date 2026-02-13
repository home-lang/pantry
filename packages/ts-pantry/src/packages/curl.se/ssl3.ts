/**
 * **ssl3** - pkgx package
 *
 * @domain `curl.se/ssl3`
 * @version `8.18.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install curl.se/ssl3`
 * @dependencies `openssl.org^3`, `curl.se/ca-certs`, `zlib.net^1.2.11`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.curlsessl3
 * console.log(pkg.name)        // "ssl3"
 * console.log(pkg.versions[0]) // "8.18.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/curl-se/ssl3.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const curlsessl3Package = {
  /**
   * The display name of this package.
   */
  name: 'ssl3' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'curl.se/ssl3' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/curl.se/ssl3/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install curl.se/ssl3' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +curl.se/ssl3 -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install curl.se/ssl3' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openssl.org^3',
    'curl.se/ca-certs',
    'zlib.net^1.2.11',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '8.18.0',
  ] as const,
  aliases: [] as const,
}

export type Curlsessl3Package = typeof curlsessl3Package
