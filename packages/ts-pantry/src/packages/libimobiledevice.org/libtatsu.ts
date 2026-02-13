/**
 * **libtatsu** - pkgx package
 *
 * @domain `libimobiledevice.org/libtatsu`
 * @version `1.0.5` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install libimobiledevice.org/libtatsu`
 * @dependencies `libimobiledevice.org/libplist^2.6`, `rockdaboot.github.io/libpsl`, `curl.se>=7`
 * @buildDependencies `gnu.org/libtool` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.libimobiledeviceorglibtatsu
 * console.log(pkg.name)        // "libtatsu"
 * console.log(pkg.versions[0]) // "1.0.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/libimobiledevice-org/libtatsu.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libimobiledeviceorglibtatsuPackage = {
  /**
   * The display name of this package.
   */
  name: 'libtatsu' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'libimobiledevice.org/libtatsu' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/libimobiledevice.org/libtatsu/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install libimobiledevice.org/libtatsu' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +libimobiledevice.org/libtatsu -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install libimobiledevice.org/libtatsu' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'libimobiledevice.org/libplist^2.6',
    'rockdaboot.github.io/libpsl',
    'curl.se>=7',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/libtool',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.0.5',
  ] as const,
  aliases: [] as const,
}

export type LibimobiledeviceorglibtatsuPackage = typeof libimobiledeviceorglibtatsuPackage
