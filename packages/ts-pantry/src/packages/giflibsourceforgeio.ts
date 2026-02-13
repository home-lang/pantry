/**
 * **gif** - Library and utilities for processing GIFs
 *
 * @domain `giflib.sourceforge.io`
 * @programs `gif2rgb`, `gifbuild`, `gifclrmp`, `giffix`, `giftext`, ... (+1 more)
 * @version `5.2.2` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install giflib.sourceforge.io`
 * @homepage https://giflib.sourceforge.net/
 * @buildDependencies `gnu.org/patch`, `imagemagick.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.giflibsourceforgeio
 * console.log(pkg.name)        // "gif"
 * console.log(pkg.description) // "Library and utilities for processing GIFs"
 * console.log(pkg.programs)    // ["gif2rgb", "gifbuild", ...]
 * console.log(pkg.versions[0]) // "5.2.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/giflib-sourceforge-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const giflibsourceforgeioPackage = {
  /**
   * The display name of this package.
   */
  name: 'gif' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'giflib.sourceforge.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Library and utilities for processing GIFs' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/giflib.sourceforge.io/package.yml' as const,
  homepageUrl: 'https://giflib.sourceforge.net/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install giflib.sourceforge.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +giflib.sourceforge.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install giflib.sourceforge.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'gif2rgb',
    'gifbuild',
    'gifclrmp',
    'giffix',
    'giftext',
    'giftool',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/patch',
    'imagemagick.org',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '5.2.2',
    '5.2.1',
  ] as const,
  aliases: [] as const,
}

export type GiflibsourceforgeioPackage = typeof giflibsourceforgeioPackage
