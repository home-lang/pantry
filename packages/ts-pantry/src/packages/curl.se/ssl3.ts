/**
 * **ssl3** - pkgx package
 *
 * @domain `curl.se/ssl3`
 * @version `8.23.0` (20 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install curl.se/ssl3`
 * @dependencies `openssl.org^3`, `curl.se/ca-certs`, `zlib.net^1.2.11`, ... (+4 more)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.curlsessl3
 * console.log(pkg.name)        // "ssl3"
 * console.log(pkg.versions[0]) // "8.23.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/curl-se/ssl3.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install curl.se/ssl3' as const,
  pantryInstallCommand: 'pantry install curl.se/ssl3' as const,
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
    'nghttp2.org',
    'gnu.org/libidn2',
    'github.com/google/brotli',
    'facebook.com/zstd',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '8.23.0',
    '8.22.0',
    '8.21.0',
    '8.20.0',
    '8.19.0',
    '8.18.0',
    '8.17.0',
    '8.16.0',
    '8.15.0',
    '8.14.1',
    '8.14.0',
    '8.13.0',
    '8.12.1',
    '8.12.0',
    '8.11.1',
    '8.11.0',
    '8.10.1',
    '8.10.0',
    '8.9.1',
    '8.9.0',
  ] as const,
  aliases: [] as const,
}

export type Curlsessl3Package = typeof curlsessl3Package
