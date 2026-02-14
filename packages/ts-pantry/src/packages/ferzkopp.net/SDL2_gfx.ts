/**
 * **SDL2_gfx** - pkgx package
 *
 * @domain `ferzkopp.net/SDL2_gfx`
 * @version `1.0.4` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install ferzkopp.net/SDL2_gfx`
 * @dependencies `libsdl.org@2`
 * @buildDependencies `gnu.org/autoconf`, `gnu.org/automake`, `gnu.org/libtool` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.ferzkoppnetsdl2_gfx
 * console.log(pkg.name)        // "SDL2_gfx"
 * console.log(pkg.versions[0]) // "1.0.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/ferzkopp-net/SDL2_gfx.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const ferzkoppnetsdl2_gfxPackage = {
  /**
  * The display name of this package.
  */
  name: 'SDL2_gfx' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'ferzkopp.net/SDL2_gfx' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/ferzkopp.net/SDL2_gfx/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install ferzkopp.net/SDL2_gfx' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +ferzkopp.net/SDL2_gfx -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install ferzkopp.net/SDL2_gfx' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'libsdl.org@2',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/autoconf',
    'gnu.org/automake',
    'gnu.org/libtool',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.0.4',
  ] as const,
  aliases: [] as const,
}

export type Ferzkoppnetsdl2_gfxPackage = typeof ferzkoppnetsdl2_gfxPackage
