/**
 * **cairo-trace** - Vector graphics library with cross-device output support
 *
 * @domain `cairographics.org`
 * @programs `cairo-trace`
 * @version `1.18.4` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install cairographics.org`
 * @homepage https://cairographics.org/
 * @dependencies `libpng.org@1`, `pixman.org^0.40.0`, `freetype.org@2`, ... (+8 more)
 * @buildDependencies `libexpat.github.io@=2.4.9`, `gnu.org/libtool@^2`, `mesonbuild.com@^1` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cairographicsorg
 * console.log(pkg.name)        // "cairo-trace"
 * console.log(pkg.description) // "Vector graphics library with cross-device outpu..."
 * console.log(pkg.programs)    // ["cairo-trace"]
 * console.log(pkg.versions[0]) // "1.18.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/cairographics-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cairographicsorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'cairo-trace' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'cairographics.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Vector graphics library with cross-device output support' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/cairographics.org/package.yml' as const,
  homepageUrl: 'https://cairographics.org/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install cairographics.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +cairographics.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install cairographics.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'cairo-trace',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'libpng.org@1',
    'pixman.org^0.40.0',
    'freetype.org@2',
    'gnome.org/glib@2',
    'freedesktop.org/fontconfig@2',
    'sourceware.org/bzip2@1',
    'x.org/x11',
    'x.org/xcb',
    'x.org/exts',
    'x.org/xrender',
    'oberhumer.com/lzo',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'libexpat.github.io@=2.4.9',
    'gnu.org/libtool@^2',
    'mesonbuild.com@^1',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.18.4',
    '1.18.2',
    '1.18.0',
    '1.16.0',
  ] as const,
  aliases: [] as const,
}

export type CairographicsorgPackage = typeof cairographicsorgPackage
