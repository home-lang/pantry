/**
 * **leptonica** - Leptonica is an open source library containing software that is broadly useful for image processing and image analysis applications. The official github repository for Leptonica is: danbloomberg/leptonica.  See leptonica.org for more documentation.
 *
 * @domain `leptonica.org`
 * @programs `convertfilestopdf`, `convertfilestops`, `convertformat`, `convertsegfilestopdf`, `convertsegfilestops`, ... (+5 more)
 * @version `1.87.0` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install leptonica.org`
 * @homepage http://www.leptonica.org/
 * @dependencies `giflib.sourceforge.io@5`, `libjpeg-turbo.org@2`, `libpng.org@1`, ... (+3 more)
 * @buildDependencies `gnu.org/wget` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.leptonicaorg
 * console.log(pkg.name)        // "leptonica"
 * console.log(pkg.description) // "Leptonica is an open source library containing ..."
 * console.log(pkg.programs)    // ["convertfilestopdf", "convertfilestops", ...]
 * console.log(pkg.versions[0]) // "1.87.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/leptonica-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const leptonicaorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'leptonica' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'leptonica.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Leptonica is an open source library containing software that is broadly useful for image processing and image analysis applications. The official github repository for Leptonica is: danbloomberg/leptonica.  See leptonica.org for more documentation.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/leptonica.org/package.yml' as const,
  homepageUrl: 'http://www.leptonica.org/' as const,
  githubUrl: 'https://github.com/DanBloomberg/leptonica' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install leptonica.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +leptonica.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install leptonica.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'convertfilestopdf',
    'convertfilestops',
    'convertformat',
    'convertsegfilestopdf',
    'convertsegfilestops',
    'converttopdf',
    'converttops',
    'fileinfo',
    'imagetops',
    'xtractprotos',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'giflib.sourceforge.io@5',
    'libjpeg-turbo.org@2',
    'libpng.org@1',
    'simplesystems.org/libtiff@4',
    'openjpeg.org',
    'google.com/webp',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/wget',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.87.0',
    '1.86.0',
    '1.85.0',
    '1.84.1',
    '1.84.0',
    '1.83.1',
  ] as const,
  aliases: [] as const,
}

export type LeptonicaorgPackage = typeof leptonicaorgPackage
