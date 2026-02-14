/**
 * **musepack** - Audio compression format and tools
 *
 * @domain `musepack.net`
 * @programs `mpc2sv8`, `mpcchap`, `mpccut`, `mpcdec`, `mpcenc`, ... (+2 more)
 * @version `475.0.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install musepack.net`
 * @homepage https://www.musepack.net/
 * @dependencies `musepack.net/libreplaygain`, `musepack.net/libcuefile`
 * @buildDependencies `cmake.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.musepacknet
 * console.log(pkg.name)        // "musepack"
 * console.log(pkg.description) // "Audio compression format and tools"
 * console.log(pkg.programs)    // ["mpc2sv8", "mpcchap", ...]
 * console.log(pkg.versions[0]) // "475.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/musepack-net.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const musepacknetPackage = {
  /**
  * The display name of this package.
  */
  name: 'musepack' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'musepack.net' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Audio compression format and tools' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/musepack.net/package.yml' as const,
  homepageUrl: 'https://www.musepack.net/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install musepack.net' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +musepack.net -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install musepack.net' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'mpc2sv8',
    'mpcchap',
    'mpccut',
    'mpcdec',
    'mpcenc',
    'mpcgain',
    'wavcmp',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'musepack.net/libreplaygain',
    'musepack.net/libcuefile',
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
    '475.0.0',
  ] as const,
  aliases: [] as const,
}

export type MusepacknetPackage = typeof musepacknetPackage
