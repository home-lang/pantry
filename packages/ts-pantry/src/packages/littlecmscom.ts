/**
 * **littlecms** - A free, open source, CMM engine. It provides fast transforms between ICC profiles.
 *
 * @domain `littlecms.com`
 * @programs `jpgicc`, `linkicc`, `psicc`, `tificc`, `transicc`
 * @version `2.18.0` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install littlecms.com`
 * @homepage https://www.littlecms.com/
 * @dependencies `simplesystems.org/libtiff^4`, `libjpeg-turbo.org^2`
 * @buildDependencies `gnu.org/wget` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.littlecmscom
 * console.log(pkg.name)        // "littlecms"
 * console.log(pkg.description) // "A free, open source, CMM engine. It provides fa..."
 * console.log(pkg.programs)    // ["jpgicc", "linkicc", ...]
 * console.log(pkg.versions[0]) // "2.18.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/littlecms-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const littlecmscomPackage = {
  /**
   * The display name of this package.
   */
  name: 'littlecms' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'littlecms.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A free, open source, CMM engine. It provides fast transforms between ICC profiles.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/littlecms.com/package.yml' as const,
  homepageUrl: 'https://www.littlecms.com/' as const,
  githubUrl: 'https://github.com/mm2/Little-CMS' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install littlecms.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +littlecms.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install littlecms.com' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'jpgicc',
    'linkicc',
    'psicc',
    'tificc',
    'transicc',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'simplesystems.org/libtiff^4',
    'libjpeg-turbo.org^2',
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
    '2.18.0',
    '2.17.0',
    '2.16.0',
    '2.15.0',
    '2.12.0',
  ] as const,
  aliases: [] as const,
}

export type LittlecmscomPackage = typeof littlecmscomPackage
