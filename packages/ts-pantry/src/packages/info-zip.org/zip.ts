/**
 * **zip** - Compression and file packaging/archive utility
 *
 * @domain `info-zip.org/zip`
 * @programs `zip`, `zipcloak`, `zipnote`, `zipsplit`
 * @version `3.0.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install info-zip.org/zip`
 * @name `zip`
 * @homepage https://infozip.sourceforge.net/Zip.html
 * @dependencies `sourceware.org/bzip2`
 * @buildDependencies `gnu.org/gcc`, `gnu.org/wget`, `gnu.org/patch` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * // Access the package
 * const pkg = pantry.zip
 * // Or access via domain
 * const samePkg = pantry.infoziporgzip
 * console.log(pkg === samePkg) // true
 * console.log(pkg.name)        // "zip"
 * console.log(pkg.description) // "Compression and file packaging/archive utility"
 * console.log(pkg.programs)    // ["zip", "zipcloak", ...]
 * console.log(pkg.versions[0]) // "3.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/info-zip-org/zip.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const zipPackage = {
  /**
  * The display name of this package.
  */
  name: 'zip' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'info-zip.org/zip' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Compression and file packaging/archive utility' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/info-zip.org/zip/package.yml' as const,
  homepageUrl: 'https://infozip.sourceforge.net/Zip.html' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install info-zip.org/zip' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +info-zip.org/zip -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install info-zip.org/zip' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'zip',
    'zipcloak',
    'zipnote',
    'zipsplit',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'sourceware.org/bzip2',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/gcc',
    'gnu.org/wget',
    'gnu.org/patch',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '3.0.0',
  ] as const,
  /**
  * Alternative names for this package.
  * You can use any of these names to access the package.
  */
  aliases: [] as const,
}

export type ZipPackage = typeof zipPackage
