/**
 * **libpng** - LIBPNG: Portable Network Graphics support, official libpng repository
 *
 * @domain `libpng.org`
 * @programs `libpng-config`, `libpng16-config`, `png-fix-itxt`, `pngfix`
 * @version `1.6.54` (17 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install libpng.org`
 * @homepage http://www.libpng.org/pub/png/libpng.html
 * @dependencies `zlib.net@1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.libpngorg
 * console.log(pkg.name)        // "libpng"
 * console.log(pkg.description) // "LIBPNG: Portable Network Graphics support, offi..."
 * console.log(pkg.programs)    // ["libpng-config", "libpng16-config", ...]
 * console.log(pkg.versions[0]) // "1.6.54" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/libpng-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libpngorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'libpng' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'libpng.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'LIBPNG: Portable Network Graphics support, official libpng repository' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/libpng.org/package.yml' as const,
  homepageUrl: 'http://www.libpng.org/pub/png/libpng.html' as const,
  githubUrl: 'https://github.com/glennrp/libpng' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install libpng.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +libpng.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install libpng.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'libpng-config',
    'libpng16-config',
    'png-fix-itxt',
    'pngfix',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'zlib.net@1',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.6.54',
    '1.6.53',
    '1.6.52',
    '1.6.51',
    '1.6.50',
    '1.6.49',
    '1.6.48',
    '1.6.47',
    '1.6.46',
    '1.6.45',
    '1.6.44',
    '1.6.43',
    '1.6.42',
    '1.6.41',
    '1.6.40',
    '1.6.39',
    '1.6.35',
  ] as const,
  aliases: [] as const,
}

export type LibpngorgPackage = typeof libpngorgPackage
