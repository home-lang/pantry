/**
 * **tuxpaint** - pkgx package
 *
 * @domain `tuxpaint.org`
 * @version `0.9.35` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install tuxpaint.org`
 * @dependencies `cairographics.org`, `ferzkopp.net/SDL2_gfx`, `github.com/markuskimius/SDL2_Pango`, ... (+12 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `freedesktop.org/appstream`, `gnu.org/bash`, `gnu.org/gperf`, ... (+1 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.tuxpaintorg
 * console.log(pkg.name)        // "tuxpaint"
 * console.log(pkg.versions[0]) // "0.9.35" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/tuxpaint-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const tuxpaintorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'tuxpaint' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'tuxpaint.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/tuxpaint.org/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install tuxpaint.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +tuxpaint.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install tuxpaint.org' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'cairographics.org',
    'ferzkopp.net/SDL2_gfx',
    'github.com/markuskimius/SDL2_Pango',
    'gnome.org/librsvg',
    'gnome.org/libxml2',
    'gnome.org/pango',
    'gnu.org/fribidi',
    'libpng.org',
    'libsdl.org@2',
    'libsdl.org/SDL_image@2',
    'libsdl.org/SDL_mixer@2',
    'libsdl.org/SDL_ttf@2',
    'pngquant.org/lib',
    'zlib.net',
    'linux:github.com/rrthomas/libpaper',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'freedesktop.org/appstream',
    'gnu.org/bash',
    'gnu.org/gperf',
    'imagemagick.org',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.9.35',
  ] as const,
  aliases: [] as const,
}

export type TuxpaintorgPackage = typeof tuxpaintorgPackage
