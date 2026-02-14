/**
 * **idevicedate** - A cross-platform protocol library to communicate with iOS devices
 *
 * @domain `libimobiledevice.org`
 * @programs `idevicedate`
 * @version `1.4.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install libimobiledevice.org`
 * @homepage https://www.libimobiledevice.org/
 * @dependencies `libimobiledevice.org/libplist^2.4`, `libimobiledevice.org/libtatsu^1`, `libimobiledevice.org/libimobiledevice-glue^1.3`, ... (+3 more)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.libimobiledeviceorg
 * console.log(pkg.name)        // "idevicedate"
 * console.log(pkg.description) // "A cross-platform protocol library to communicat..."
 * console.log(pkg.programs)    // ["idevicedate"]
 * console.log(pkg.versions[0]) // "1.4.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/libimobiledevice-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libimobiledeviceorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'idevicedate' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'libimobiledevice.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A cross-platform protocol library to communicate with iOS devices' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/libimobiledevice.org/package.yml' as const,
  homepageUrl: 'https://www.libimobiledevice.org/' as const,
  githubUrl: 'https://github.com/libimobiledevice/libimobiledevice' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install libimobiledevice.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +libimobiledevice.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install libimobiledevice.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'idevicedate',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'libimobiledevice.org/libplist^2.4',
    'libimobiledevice.org/libtatsu^1',
    'libimobiledevice.org/libimobiledevice-glue^1.3',
    'gnu.org/libtasn1^4.19',
    'libimobiledevice.org/libusbmuxd^2',
    'openssl.org^1.1',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.4.0',
    '1.3.0',
  ] as const,
  aliases: [] as const,
}

export type LibimobiledeviceorgPackage = typeof libimobiledeviceorgPackage
