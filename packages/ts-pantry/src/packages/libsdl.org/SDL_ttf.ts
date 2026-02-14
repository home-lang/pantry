/**
 * **SDL_ttf** - pkgx package
 *
 * @domain `libsdl.org/SDL_ttf`
 * @version `2.24.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install libsdl.org/SDL_ttf`
 * @dependencies `freetype.org>=2.0.4`, `harfbuzz.org>=2.3.1`, `libsdl.org^2.0.10`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.libsdlorgsdl_ttf
 * console.log(pkg.name)        // "SDL_ttf"
 * console.log(pkg.versions[0]) // "2.24.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/libsdl-org/SDL_ttf.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libsdlorgsdl_ttfPackage = {
  /**
  * The display name of this package.
  */
  name: 'SDL_ttf' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'libsdl.org/SDL_ttf' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/libsdl.org/SDL_ttf/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install libsdl.org/SDL_ttf' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +libsdl.org/SDL_ttf -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install libsdl.org/SDL_ttf' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'freetype.org>=2.0.4',
    'harfbuzz.org>=2.3.1',
    'libsdl.org^2.0.10',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.24.0',
  ] as const,
  aliases: [] as const,
}

export type Libsdlorgsdl_ttfPackage = typeof libsdlorgsdl_ttfPackage
