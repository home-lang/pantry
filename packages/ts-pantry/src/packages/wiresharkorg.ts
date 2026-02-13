/**
 * **wireshark** - Network analyzer and capture tool - without graphical user interface
 *
 * @domain `wireshark.org`
 * @programs `capinfos`, `captype`, `dumpcap`, `editcap`, `idl2wrs`, ... (+8 more)
 * @version `4.6.3` (43 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install wireshark.org`
 * @homepage https://www.wireshark.org
 * @dependencies `c-ares.org^1.23`, `gnome.org/glib^2.78.3`, `gnutls.org^3.8.2`, ... (+10 more)
 * @buildDependencies `cmake.org`, `gnu.org/bison`, `github.com/westes/flex`, ... (+2 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.wiresharkorg
 * console.log(pkg.name)        // "wireshark"
 * console.log(pkg.description) // "Network analyzer and capture tool - without gra..."
 * console.log(pkg.programs)    // ["capinfos", "captype", ...]
 * console.log(pkg.versions[0]) // "4.6.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/wireshark-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const wiresharkorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'wireshark' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'wireshark.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Network analyzer and capture tool - without graphical user interface' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/wireshark.org/package.yml' as const,
  homepageUrl: 'https://www.wireshark.org' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install wireshark.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +wireshark.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install wireshark.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'capinfos',
    'captype',
    'dumpcap',
    'editcap',
    'idl2wrs',
    'mergecap',
    'mmdbresolve',
    'randpkt',
    'rawshark',
    'reordercap',
    'sharkd',
    'text2pcap',
    'tshark',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'c-ares.org^1.23',
    'gnome.org/glib^2.78.3',
    'gnutls.org^3.8.2',
    'gnupg.org/libgcrypt^1.10.3',
    'gnupg.org/libgpg-error^1.47',
    'github.com/maxmind/libmaxminddb^1.8',
    'nghttp2.org^1.58',
    'ibr.cs.tu-bs.de/libsmi^0.4.8',
    'libssh.org^0.10.5',
    'lua.org^5.4',
    'github.com/xiph/speexdsp^1.2.1',
    'tcpdump.org^1.10.4',
    'gnome.org/libxml2^2.12.3',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org',
    'gnu.org/bison',
    'github.com/westes/flex',
    'python.org@^3.11',
    'perl.org@5',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '4.6.3',
    '4.6.2',
    '4.6.1',
    '4.6.0',
    '4.4.13',
    '4.4.12',
    '4.4.11',
    '4.4.9',
    '4.4.8',
    '4.4.7',
    '4.4.6',
    '4.4.5',
    '4.4.4',
    '4.4.3',
    '4.4.2',
    '4.4.1',
    '4.4.0',
    '4.3.1',
    '4.3.0',
    '4.2.14',
    '4.2.13',
    '4.2.12',
    '4.2.11',
    '4.2.10',
    '4.2.9',
    '4.2.8',
    '4.2.7',
    '4.2.5',
    '4.2.3',
    '4.2.2',
    '4.2.1',
    '4.2.0',
    '4.0.17',
    '4.0.16',
    '4.0.15',
    '4.0.14',
    '4.0.13',
    '4.0.12',
    '3.6.24',
    '3.6.23',
    '3.6.22',
    '3.6.21',
    '3.6.20',
  ] as const,
  aliases: [] as const,
}

export type WiresharkorgPackage = typeof wiresharkorgPackage
