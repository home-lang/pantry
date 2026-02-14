/**
 * **libsrtp** - Library for SRTP (Secure Realtime Transport Protocol)
 *
 * @domain `cisco.com/libsrtp`
 * @version `2.7.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install cisco.com/libsrtp`
 * @dependencies `openssl.org~1`
 * @buildDependencies `linux:gnu.org/gcc` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.ciscocomlibsrtp
 * console.log(pkg.name)        // "libsrtp"
 * console.log(pkg.description) // "Library for SRTP (Secure Realtime Transport Pro..."
 * console.log(pkg.versions[0]) // "2.7.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/cisco-com/libsrtp.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const ciscocomlibsrtpPackage = {
  /**
  * The display name of this package.
  */
  name: 'libsrtp' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'cisco.com/libsrtp' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Library for SRTP (Secure Realtime Transport Protocol) ' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/cisco.com/libsrtp/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/cisco/libsrtp' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install cisco.com/libsrtp' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +cisco.com/libsrtp -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install cisco.com/libsrtp' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'openssl.org~1',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'linux:gnu.org/gcc',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.7.0',
    '2.6.0',
    '2.5.0',
  ] as const,
  aliases: [] as const,
}

export type CiscocomlibsrtpPackage = typeof ciscocomlibsrtpPackage
