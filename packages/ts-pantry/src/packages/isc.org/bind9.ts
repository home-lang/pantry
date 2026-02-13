/**
 * **bind9** - pkgx package
 *
 * @domain `isc.org/bind9`
 * @programs `arpaname`, `delv`, `dig`, `dnssec-cds`, `dnssec-dsfromkey`, ... (+24 more)
 * @version `9.21.17` (34 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install isc.org/bind9`
 * @dependencies `gnome.org/libxml2@2.13`, `nghttp2.org@1.57`, `libuv.org@1.49`, ... (+8 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `mesonbuild.com@1`, `cmake.org@3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.iscorgbind9
 * console.log(pkg.name)        // "bind9"
 * console.log(pkg.programs)    // ["arpaname", "delv", ...]
 * console.log(pkg.versions[0]) // "9.21.17" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/isc-org/bind9.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const iscorgbind9Package = {
  /**
   * The display name of this package.
   */
  name: 'bind9' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'isc.org/bind9' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/isc.org/bind9/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install isc.org/bind9' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +isc.org/bind9 -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install isc.org/bind9' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'arpaname',
    'delv',
    'dig',
    'dnssec-cds',
    'dnssec-dsfromkey',
    'dnssec-importkey',
    'dnssec-keyfromlabel',
    'dnssec-keygen',
    'dnssec-ksr',
    'dnssec-revoke',
    'dnssec-settime',
    'dnssec-signzone',
    'dnssec-verify',
    'host',
    'mdig',
    'named-checkconf',
    'named-checkzone',
    'named-compilezone',
    'named-journalprint',
    'named-nzd2nzf',
    'named-rrchecker',
    'nsec3hash',
    'nslookup',
    'nsupdate',
    'ddns-confgen',
    'named',
    'rndc',
    'rndc-confgen',
    'tsig-keygen',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'gnome.org/libxml2@2.13',
    'nghttp2.org@1.57',
    'libuv.org@1.49',
    'liburcu.org@0.15',
    'openldap.org/liblmdb@0.9',
    'openssl.org@1.1',
    'gnu.org/readline@8.2',
    'github.com/json-c/json-c@0.18',
    'gnu.org/libidn2@2.3',
    'jemalloc.net@5',
    'linux:kernel.org/libcap',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'mesonbuild.com@1',
    'cmake.org@3',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '9.21.17',
    '9.21.16',
    '9.21.15',
    '9.21.14',
    '9.21.12',
    '9.21.11',
    '9.21.10',
    '9.21.9',
    '9.21.8',
    '9.21.7',
    '9.21.6',
    '9.21.5',
    '9.21.4',
    '9.20.18',
    '9.20.17',
    '9.20.16',
    '9.20.15',
    '9.20.13',
    '9.20.12',
    '9.20.11',
    '9.20.10',
    '9.20.9',
    '9.20.8',
    '9.20.7',
    '9.20.6',
    '9.18.44',
    '9.18.43',
    '9.18.42',
    '9.18.41',
    '9.18.39',
    '9.18.38',
    '9.18.37',
    '9.18.36',
    '9.18.35',
  ] as const,
  aliases: [] as const,
}

export type Iscorgbind9Package = typeof iscorgbind9Package
