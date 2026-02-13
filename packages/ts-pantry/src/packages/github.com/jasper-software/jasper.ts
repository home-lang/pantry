/**
 * **jasper** - Official Repository for the JasPer Image Coding Toolkit
 *
 * @domain `github.com/jasper-software/jasper`
 * @programs `jasper`
 * @version `4.2.8` (14 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/jasper-software/jasper`
 * @homepage https://ece.engr.uvic.ca/~frodo/jasper/
 * @dependencies `libjpeg-turbo.org^2`
 * @buildDependencies `cmake.org@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomjaspersoftwarejasper
 * console.log(pkg.name)        // "jasper"
 * console.log(pkg.description) // "Official Repository for the JasPer Image Coding..."
 * console.log(pkg.programs)    // ["jasper"]
 * console.log(pkg.versions[0]) // "4.2.8" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/jasper-software/jasper.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const jasperPackage = {
  /**
   * The display name of this package.
   */
  name: 'jasper' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/jasper-software/jasper' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Official Repository for the JasPer Image Coding Toolkit' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/jasper-software/jasper/package.yml' as const,
  homepageUrl: 'https://ece.engr.uvic.ca/~frodo/jasper/' as const,
  githubUrl: 'https://github.com/jasper-software/jasper' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/jasper-software/jasper' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/jasper-software/jasper -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/jasper-software/jasper' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'jasper',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'libjpeg-turbo.org^2',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org@^3',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '4.2.8',
    '4.2.7',
    '4.2.6',
    '4.2.5',
    '4.2.4',
    '4.2.3',
    '4.2.2',
    '4.2.1',
    '4.2.0',
    '4.1.2',
    '4.1.1',
    '4.1.0',
    '4.0.1',
    '4.0.0',
  ] as const,
  aliases: [] as const,
}

export type JasperPackage = typeof jasperPackage
