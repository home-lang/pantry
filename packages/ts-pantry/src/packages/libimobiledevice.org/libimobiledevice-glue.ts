/**
 * **libimobiledevice-glue** - A library with common code used by libraries and tools around the libimobiledevice project
 *
 * @domain `libimobiledevice.org/libimobiledevice-glue`
 * @version `1.3.2` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install libimobiledevice.org/libimobiledevice-glue`
 * @dependencies `libimobiledevice.org/libplist^2.4`
 * @buildDependencies `gnu.org/libtool` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.libimobiledeviceorglibimobiledeviceglue
 * console.log(pkg.name)        // "libimobiledevice-glue"
 * console.log(pkg.description) // "A library with common code used by libraries an..."
 * console.log(pkg.versions[0]) // "1.3.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/libimobiledevice-org/libimobiledevice-glue.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libimobiledeviceorglibimobiledevicegluePackage = {
  /**
  * The display name of this package.
  */
  name: 'libimobiledevice-glue' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'libimobiledevice.org/libimobiledevice-glue' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A library with common code used by libraries and tools around the libimobiledevice project' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/libimobiledevice.org/libimobiledevice-glue/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/libimobiledevice/libimobiledevice-glue' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install libimobiledevice.org/libimobiledevice-glue' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +libimobiledevice.org/libimobiledevice-glue -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install libimobiledevice.org/libimobiledevice-glue' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'libimobiledevice.org/libplist^2.4',
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
    '1.3.2',
    '1.3.1',
    '1.3.0',
    '1.2.0',
  ] as const,
  aliases: [] as const,
}

export type LibimobiledeviceorglibimobiledevicegluePackage = typeof libimobiledeviceorglibimobiledevicegluePackage
