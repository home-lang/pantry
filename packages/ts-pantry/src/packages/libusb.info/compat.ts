/**
 * **libusb-compat** - Library for USB device access
 *
 * @domain `libusb.info/compat`
 * @programs `libusb-config`
 * @version `0.1.8` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install libusb.info/compat`
 * @homepage https://libusb.info/
 * @dependencies `libusb.info^1`
 * @buildDependencies `gnu.org/autoconf`, `gnu.org/automake`, `gnu.org/libtool` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.libusbinfocompat
 * console.log(pkg.name)        // "libusb-compat"
 * console.log(pkg.description) // "Library for USB device access"
 * console.log(pkg.programs)    // ["libusb-config"]
 * console.log(pkg.versions[0]) // "0.1.8" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/libusb-info/compat.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libusbinfocompatPackage = {
  /**
   * The display name of this package.
   */
  name: 'libusb-compat' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'libusb.info/compat' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Library for USB device access' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/libusb.info/compat/package.yml' as const,
  homepageUrl: 'https://libusb.info/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install libusb.info/compat' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +libusb.info/compat -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install libusb.info/compat' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'libusb-config',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'libusb.info^1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/autoconf',
    'gnu.org/automake',
    'gnu.org/libtool',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.1.8',
  ] as const,
  aliases: [] as const,
}

export type LibusbinfocompatPackage = typeof libusbinfocompatPackage
