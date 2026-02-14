/**
 * **srt** - Secure, Reliable, Transport
 *
 * @domain `srtalliance.org`
 * @programs `srt-ffplay`, `srt-file-transmit`, `srt-live-transmit`, `srt-tunnel`
 * @version `1.5.4` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install srtalliance.org`
 * @homepage https://www.srtalliance.org/
 * @dependencies `openssl.org`
 * @buildDependencies `cmake.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.srtallianceorg
 * console.log(pkg.name)        // "srt"
 * console.log(pkg.description) // "Secure, Reliable, Transport"
 * console.log(pkg.programs)    // ["srt-ffplay", "srt-file-transmit", ...]
 * console.log(pkg.versions[0]) // "1.5.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/srtalliance-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const srtallianceorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'srt' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'srtalliance.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Secure, Reliable, Transport' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/srtalliance.org/package.yml' as const,
  homepageUrl: 'https://www.srtalliance.org/' as const,
  githubUrl: 'https://github.com/Haivision/srt' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install srtalliance.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +srtalliance.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install srtalliance.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'srt-ffplay',
    'srt-file-transmit',
    'srt-live-transmit',
    'srt-tunnel',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'openssl.org',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.5.4',
    '1.5.3',
    '1.5.2',
  ] as const,
  aliases: [] as const,
}

export type SrtallianceorgPackage = typeof srtallianceorgPackage
