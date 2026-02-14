/**
 * **libusb.info** - A cross-platform library to access USB devices
 *
 * @domain `libusb.info`
 * @version `1.0.29` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install libusb.info`
 * @homepage https://libusb.info
 * @buildDependencies `gnu.org/autoconf`, `gnu.org/libtool`, `linux:systemd.io` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.libusbinfo
 * console.log(pkg.name)        // "libusb.info"
 * console.log(pkg.description) // "A cross-platform library to access USB devices "
 * console.log(pkg.versions[0]) // "1.0.29" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/libusb-info.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libusbinfoPackage = {
  /**
  * The display name of this package.
  */
  name: 'libusb.info' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'libusb.info' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A cross-platform library to access USB devices ' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/libusb.info/package.yml' as const,
  homepageUrl: 'https://libusb.info' as const,
  githubUrl: 'https://github.com/libusb/libusb' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install libusb.info' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +libusb.info -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install libusb.info' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'gnu.org/autoconf',
    'gnu.org/libtool',
    'linux:systemd.io',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.0.29',
    '1.0.28',
    '1.0.27',
    '1.0.26',
  ] as const,
  aliases: [] as const,
}

export type LibusbinfoPackage = typeof libusbinfoPackage
