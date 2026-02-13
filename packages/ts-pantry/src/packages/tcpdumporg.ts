/**
 * **pcap-config** - the LIBpcap interface to various kernel packet capture mechanism
 *
 * @domain `tcpdump.org`
 * @programs `pcap-config`
 * @version `1.10.6` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install tcpdump.org`
 * @homepage https://www.tcpdump.org/
 * @buildDependencies `gnu.org/make`, `gnu.org/bison`, `github.com/westes/flex` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.tcpdumporg
 * console.log(pkg.name)        // "pcap-config"
 * console.log(pkg.description) // "the LIBpcap interface to various kernel packet ..."
 * console.log(pkg.programs)    // ["pcap-config"]
 * console.log(pkg.versions[0]) // "1.10.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/tcpdump-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const tcpdumporgPackage = {
  /**
   * The display name of this package.
   */
  name: 'pcap-config' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'tcpdump.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'the LIBpcap interface to various kernel packet capture mechanism' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/tcpdump.org/package.yml' as const,
  homepageUrl: 'https://www.tcpdump.org/' as const,
  githubUrl: 'https://github.com/the-tcpdump-group/libpcap' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install tcpdump.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +tcpdump.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install tcpdump.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'pcap-config',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/make',
    'gnu.org/bison',
    'github.com/westes/flex',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.10.6',
    '1.10.5',
    '1.10.4',
  ] as const,
  aliases: [] as const,
}

export type TcpdumporgPackage = typeof tcpdumporgPackage
