/**
 * **ntp** - pkgx package
 *
 * @domain `ntp.org`
 * @programs `ntpq`, `sntp`, `ntp-keygen`, `ntp-wait`, `ntpd`, ... (+5 more)
 * @version `4.2.8.17` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install ntp.org`
 * @dependencies `openssl.org^3`
 * @buildDependencies `perl.org@^5` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.ntporg
 * console.log(pkg.name)        // "ntp"
 * console.log(pkg.programs)    // ["ntpq", "sntp", ...]
 * console.log(pkg.versions[0]) // "4.2.8.17" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/ntp-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const ntporgPackage = {
  /**
  * The display name of this package.
  */
  name: 'ntp' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'ntp.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/ntp.org/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install ntp.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +ntp.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install ntp.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'ntpq',
    'sntp',
    'ntp-keygen',
    'ntp-wait',
    'ntpd',
    'ntpdate',
    'ntpdc',
    'ntptime',
    'ntptrace',
    'update-leap',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'openssl.org^3',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'perl.org@^5',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '4.2.8.17',
  ] as const,
  aliases: [] as const,
}

export type NtporgPackage = typeof ntporgPackage
