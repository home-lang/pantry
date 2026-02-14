/**
 * **sniffnet** - Cross-platform application to monitor your network traffic
 *
 * @domain `sniffnet.net`
 * @programs `sniffnet`
 * @version `1.4.2` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install sniffnet.net`
 * @homepage https://sniffnet.net
 * @dependencies `openssl.org@1`, `tcpdump.org@1`, `linux:alsa-project.org/alsa-lib@1`, ... (+1 more) (includes OS-specific dependencies with `os:package` format)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.sniffnetnet
 * console.log(pkg.name)        // "sniffnet"
 * console.log(pkg.description) // "Cross-platform application to monitor your netw..."
 * console.log(pkg.programs)    // ["sniffnet"]
 * console.log(pkg.versions[0]) // "1.4.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/sniffnet-net.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const sniffnetnetPackage = {
  /**
  * The display name of this package.
  */
  name: 'sniffnet' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'sniffnet.net' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Cross-platform application to monitor your network traffic' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/sniffnet.net/package.yml' as const,
  homepageUrl: 'https://sniffnet.net' as const,
  githubUrl: 'https://github.com/GyulyVGC/sniffnet' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install sniffnet.net' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +sniffnet.net -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install sniffnet.net' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'sniffnet',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'openssl.org@1',
    'tcpdump.org@1',
    'linux:alsa-project.org/alsa-lib@1',
    'linux:freedesktop.org/fontconfig@2',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.4.2',
    '1.4.1',
    '1.4.0',
    '1.3.2',
    '1.3.1',
  ] as const,
  aliases: [] as const,
}

export type SniffnetnetPackage = typeof sniffnetnetPackage
