/**
 * **httpd** - Apache HTTP server
 *
 * @domain `apache.org/httpd`
 * @programs `ab`, `apachectl`, `checkgid`, `fcgistarter`, `htcacheclean`, ... (+8 more)
 * @version `2.4.66` (10 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install apache.org/httpd`
 * @homepage https://httpd.apache.org/
 * @dependencies `apache.org/apr>=1.3.0`, `apache.org/apr-util>=1.3.0`, `github.com/google/brotli`, ... (+6 more)
 * @buildDependencies `gnu.org/libtool`, `gnu.org/autoconf` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.apacheorghttpd
 * console.log(pkg.name)        // "httpd"
 * console.log(pkg.description) // "Apache HTTP server"
 * console.log(pkg.programs)    // ["ab", "apachectl", ...]
 * console.log(pkg.versions[0]) // "2.4.66" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/apache-org/httpd.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const apacheorghttpdPackage = {
  /**
  * The display name of this package.
  */
  name: 'httpd' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'apache.org/httpd' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Apache HTTP server' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/apache.org/httpd/package.yml' as const,
  homepageUrl: 'https://httpd.apache.org/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install apache.org/httpd' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +apache.org/httpd -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install apache.org/httpd' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'ab',
    'apachectl',
    'checkgid',
    'fcgistarter',
    'htcacheclean',
    'htdbm',
    'htdigest',
    'htpasswd',
    'httpd',
    'httxt2dbm',
    'logresolve',
    'rotatelogs',
    'suexec',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'apache.org/apr>=1.3.0',
    'apache.org/apr-util>=1.3.0',
    'github.com/google/brotli',
    'nghttp2.org',
    'openssl.org',
    'pcre.org/v2',
    'gnome.org/libxml2',
    'zlib.net',
    'libexpat.github.io',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/libtool',
    'gnu.org/autoconf',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.4.66',
    '2.4.65',
    '2.4.64',
    '2.4.63',
    '2.4.62',
    '2.4.61',
    '2.4.60',
    '2.4.59',
    '2.4.58',
    '2.4.57',
  ] as const,
  aliases: [] as const,
}

export type ApacheorghttpdPackage = typeof apacheorghttpdPackage
