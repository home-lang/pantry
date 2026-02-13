/**
 * **rtmpdump** - Tool for downloading RTMP streaming media
 *
 * @domain `rtmpdump.mplayerhq.hu`
 * @programs `rtmpdump`, `rtmpgw`, `rtmpsrv`, `rtmpsuck`
 * @version `2.3.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install rtmpdump.mplayerhq.hu`
 * @homepage https://rtmpdump.mplayerhq.hu/
 * @dependencies `openssl.org^1.1`, `zlib.net`
 * @buildDependencies `gnu.org/patch`, `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.rtmpdumpmplayerhqhu
 * console.log(pkg.name)        // "rtmpdump"
 * console.log(pkg.description) // "Tool for downloading RTMP streaming media"
 * console.log(pkg.programs)    // ["rtmpdump", "rtmpgw", ...]
 * console.log(pkg.versions[0]) // "2.3.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/rtmpdump-mplayerhq-hu.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const rtmpdumpmplayerhqhuPackage = {
  /**
   * The display name of this package.
   */
  name: 'rtmpdump' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'rtmpdump.mplayerhq.hu' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Tool for downloading RTMP streaming media' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/rtmpdump.mplayerhq.hu/package.yml' as const,
  homepageUrl: 'https://rtmpdump.mplayerhq.hu/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install rtmpdump.mplayerhq.hu' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +rtmpdump.mplayerhq.hu -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install rtmpdump.mplayerhq.hu' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'rtmpdump',
    'rtmpgw',
    'rtmpsrv',
    'rtmpsuck',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openssl.org^1.1',
    'zlib.net',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/patch',
    'curl.se',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.3.0',
    '2.3.0',
  ] as const,
  aliases: [] as const,
}

export type RtmpdumpmplayerhqhuPackage = typeof rtmpdumpmplayerhqhuPackage
