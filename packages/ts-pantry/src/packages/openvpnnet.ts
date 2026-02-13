/**
 * **openvpn** - pkgx package
 *
 * @domain `openvpn.net`
 * @programs `openvpn`
 * @version `2.6.17` (15 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install openvpn.net`
 * @dependencies `lz4.org^1.9`, `oberhumer.com/lzo^2.10`, `openssl.org^1.1`, ... (+2 more) (includes OS-specific dependencies with `os:package` format)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.openvpnnet
 * console.log(pkg.name)        // "openvpn"
 * console.log(pkg.programs)    // ["openvpn"]
 * console.log(pkg.versions[0]) // "2.6.17" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/openvpn-net.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const openvpnnetPackage = {
  /**
   * The display name of this package.
   */
  name: 'openvpn' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'openvpn.net' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/openvpn.net/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install openvpn.net' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +openvpn.net -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install openvpn.net' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'openvpn',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'lz4.org^1.9',
    'oberhumer.com/lzo^2.10',
    'openssl.org^1.1',
    'linux:sourceforge.net/net-tools',
    'linux:github.com/thom311/libnl',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.6.17',
    '2.6.16',
    '2.6.15',
    '2.6.14',
    '2.6.13',
    '2.6.12',
    '2.6.11',
    '2.6.10',
    '2.6.9',
    '2.6.8',
    '2.6.7',
    '2.6.6',
    '2.6.5',
    '2.6.4',
    '2.5.10',
  ] as const,
  aliases: [] as const,
}

export type OpenvpnnetPackage = typeof openvpnnetPackage
