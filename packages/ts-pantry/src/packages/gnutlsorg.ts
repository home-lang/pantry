/**
 * **gnutls** - pkgx package
 *
 * @domain `gnutls.org`
 * @programs `certtool`, `danetool`, `gnutls-cli`, `gnutls-cli-debug`, `gnutls-serv`, ... (+3 more)
 * @version `3.8.12` (13 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install gnutls.org`
 * @dependencies `freedesktop.org/p11-kit^0.26`, `gnu.org/libidn2`, `gnu.org/libunistring^1`, ... (+6 more)
 * @buildDependencies `freedesktop.org/pkg-config`, `gnu.org/make`, `gnu.org/sed`, ... (+1 more) (includes platform-specific dependencies) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.gnutlsorg
 * console.log(pkg.name)        // "gnutls"
 * console.log(pkg.programs)    // ["certtool", "danetool", ...]
 * console.log(pkg.versions[0]) // "3.8.12" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/gnutls-org.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const gnutlsorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'gnutls' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gnutls.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnutls.org/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install gnutls.org' as const,
  pantryInstallCommand: 'pantry install gnutls.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'certtool',
    'danetool',
    'gnutls-cli',
    'gnutls-cli-debug',
    'gnutls-serv',
    'ocsptool',
    'p11tool',
    'psktool',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'freedesktop.org/p11-kit^0.26',
    'gnu.org/libidn2',
    'gnu.org/libunistring^1',
    'gnu.org/libtasn1^4',
    'gnu.org/nettle>=3.10<4',
    'gnu.org/gettext',
    'gnu.org/gmp',
    'unbound.net^1',
    'curl.se/ca-certs',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * Platform-specific dependencies use `os:` or `os/arch:` prefixes (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'freedesktop.org/pkg-config',
    'gnu.org/make',
    'gnu.org/sed',
    'linux:gnu.org/gcc',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '3.8.12',
    '3.8.11',
    '3.8.10',
    '3.8.9',
    '3.8.7',
    '3.8.6',
    '3.8.5',
    '3.8.4',
    '3.8.3',
    '3.8.2',
    '3.8.1',
    '3.7.10',
    '3.6.16',
  ] as const,
  aliases: [] as const,
}

export type GnutlsorgPackage = typeof gnutlsorgPackage
