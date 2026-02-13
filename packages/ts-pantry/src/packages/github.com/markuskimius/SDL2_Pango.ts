/**
 * **SDL2_Pango** - pkgx package
 *
 * @domain `github.com/markuskimius/SDL2_Pango`
 * @version `2.1.5` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/markuskimius/SDL2_Pango`
 * @dependencies `gnome.org/pango>=1.2`, `libsdl.org^2.0.2`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcommarkuskimiussdl2_pango
 * console.log(pkg.name)        // "SDL2_Pango"
 * console.log(pkg.versions[0]) // "2.1.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/markuskimius/SDL2_Pango.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const sdl2_pangoPackage = {
  /**
   * The display name of this package.
   */
  name: 'SDL2_Pango' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/markuskimius/SDL2_Pango' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/markuskimius/SDL2_Pango/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/markuskimius/SDL2_Pango' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/markuskimius/SDL2_Pango -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/markuskimius/SDL2_Pango' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'gnome.org/pango>=1.2',
    'libsdl.org^2.0.2',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.1.5',
  ] as const,
  aliases: [] as const,
}

export type Sdl2_pangoPackage = typeof sdl2_pangoPackage
