/**
 * **exiftool** - Perl lib for reading and writing EXIF metadata
 *
 * @domain `exiftool.org`
 * @programs `exiftool`
 * @version `13.44.0` (11 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install exiftool.org`
 * @homepage https://exiftool.org
 * @dependencies `perl.org`
 * @buildDependencies `perl.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.exiftoolorg
 * console.log(pkg.name)        // "exiftool"
 * console.log(pkg.description) // "Perl lib for reading and writing EXIF metadata"
 * console.log(pkg.programs)    // ["exiftool"]
 * console.log(pkg.versions[0]) // "13.44.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/exiftool-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const exiftoolorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'exiftool' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'exiftool.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Perl lib for reading and writing EXIF metadata' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/exiftool.org/package.yml' as const,
  homepageUrl: 'https://exiftool.org' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install exiftool.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +exiftool.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install exiftool.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'exiftool',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'perl.org',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'perl.org',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '13.44.0',
    '13.36.0',
    '13.35.0',
    '13.30.0',
    '13.25.0',
    '13.10.0',
    '13.0.0',
    '12.76.0',
    '12.75.0',
    '12.70.0',
    '12.60.0',
  ] as const,
  aliases: [] as const,
}

export type ExiftoolorgPackage = typeof exiftoolorgPackage
