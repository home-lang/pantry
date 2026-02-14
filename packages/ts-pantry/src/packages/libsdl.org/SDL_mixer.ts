/**
 * **SDL_mixer** - pkgx package
 *
 * @domain `libsdl.org/SDL_mixer`
 * @version `2.8.1` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install libsdl.org/SDL_mixer`
 * @dependencies `libsdl.org^2.0.9`, `mpg123.de`, `wavpack.com>=4`, ... (+1 more)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.libsdlorgsdl_mixer
 * console.log(pkg.name)        // "SDL_mixer"
 * console.log(pkg.versions[0]) // "2.8.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/libsdl-org/SDL_mixer.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libsdlorgsdl_mixerPackage = {
  /**
  * The display name of this package.
  */
  name: 'SDL_mixer' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'libsdl.org/SDL_mixer' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/libsdl.org/SDL_mixer/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install libsdl.org/SDL_mixer' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +libsdl.org/SDL_mixer -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install libsdl.org/SDL_mixer' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'libsdl.org^2.0.9',
    'mpg123.de',
    'wavpack.com>=4',
    'xiph.org/vorbis',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.8.1',
  ] as const,
  aliases: [] as const,
}

export type Libsdlorgsdl_mixerPackage = typeof libsdlorgsdl_mixerPackage
