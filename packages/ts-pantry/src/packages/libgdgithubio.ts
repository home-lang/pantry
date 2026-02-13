/**
 * **libgd.github** - Graphics library to dynamically manipulate images
 *
 * @domain `libgd.github.io`
 * @programs `bdftogd`, `gd2copypal`, `gd2togif`, `gdcmpgif`, `giftogd2`
 * @version `2.3.3` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install libgd.github.io`
 * @homepage https://libgd.github.io/
 * @dependencies `freedesktop.org/fontconfig`, `freetype.org`, `libjpeg-turbo.org`, ... (+5 more)
 * @buildDependencies `gnu.org/autoconf`, `gnu.org/libtool` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.libgdgithubio
 * console.log(pkg.name)        // "libgd.github"
 * console.log(pkg.description) // "Graphics library to dynamically manipulate images"
 * console.log(pkg.programs)    // ["bdftogd", "gd2copypal", ...]
 * console.log(pkg.versions[0]) // "2.3.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/libgd-github-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libgdgithubioPackage = {
  /**
   * The display name of this package.
   */
  name: 'libgd.github' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'libgd.github.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Graphics library to dynamically manipulate images' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/libgd.github.io/package.yml' as const,
  homepageUrl: 'https://libgd.github.io/' as const,
  githubUrl: 'https://github.com/libgd/libgd' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install libgd.github.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +libgd.github.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install libgd.github.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'bdftogd',
    'gd2copypal',
    'gd2togif',
    'gdcmpgif',
    'giftogd2',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'freedesktop.org/fontconfig',
    'freetype.org',
    'libjpeg-turbo.org',
    'github.com/AOMediaCodec/libavif',
    'libpng.org',
    'simplesystems.org/libtiff',
    'google.com/webp',
    'zlib.net',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/autoconf',
    'gnu.org/libtool',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.3.3',
  ] as const,
  aliases: [] as const,
}

export type LibgdgithubioPackage = typeof libgdgithubioPackage
