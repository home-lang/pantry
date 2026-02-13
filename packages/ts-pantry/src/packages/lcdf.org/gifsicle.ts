/**
 * **gifsicle** - Create, manipulate, and optimize GIF images and animations
 *
 * @domain `lcdf.org/gifsicle`
 * @programs `gifsicle`
 * @version `1.96.0` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install lcdf.org/gifsicle`
 * @homepage https://www.lcdf.org/gifsicle/
 * @buildDependencies `gnu.org/autoconf@^2`, `gnu.org/automake@^1` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.lcdforggifsicle
 * console.log(pkg.name)        // "gifsicle"
 * console.log(pkg.description) // "Create, manipulate, and optimize GIF images and..."
 * console.log(pkg.programs)    // ["gifsicle"]
 * console.log(pkg.versions[0]) // "1.96.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/lcdf-org/gifsicle.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const lcdforggifsiclePackage = {
  /**
   * The display name of this package.
   */
  name: 'gifsicle' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'lcdf.org/gifsicle' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Create, manipulate, and optimize GIF images and animations' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/lcdf.org/gifsicle/package.yml' as const,
  homepageUrl: 'https://www.lcdf.org/gifsicle/' as const,
  githubUrl: 'https://github.com/kohler/gifsicle' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install lcdf.org/gifsicle' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +lcdf.org/gifsicle -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install lcdf.org/gifsicle' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'gifsicle',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/autoconf@^2',
    'gnu.org/automake@^1',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.96.0',
    '1.95.0',
    '1.94.0',
    '1.93.0',
  ] as const,
  aliases: [] as const,
}

export type LcdforggifsiclePackage = typeof lcdforggifsiclePackage
