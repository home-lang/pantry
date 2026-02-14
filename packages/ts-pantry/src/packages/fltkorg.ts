/**
 * **fltk** - FLTK - Fast Light Tool Kit - https://github.com/fltk/fltk - cross platform GUI development
 *
 * @domain `fltk.org`
 * @programs `fluid`, `fltk-config`
 * @version `1.4.4` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install fltk.org`
 * @homepage https://www.fltk.org/
 * @dependencies `libjpeg-turbo.org^2`, `libpng.org^1`, `linux:x.org/xft^2`, ... (+2 more) (includes OS-specific dependencies with `os:package` format)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.fltkorg
 * console.log(pkg.name)        // "fltk"
 * console.log(pkg.description) // "FLTK - Fast Light Tool Kit - https://github.com..."
 * console.log(pkg.programs)    // ["fluid", "fltk-config"]
 * console.log(pkg.versions[0]) // "1.4.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/fltk-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const fltkorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'fltk' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'fltk.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'FLTK - Fast Light Tool Kit - https://github.com/fltk/fltk - cross platform GUI development' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/fltk.org/package.yml' as const,
  homepageUrl: 'https://www.fltk.org/' as const,
  githubUrl: 'https://github.com/fltk/fltk' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install fltk.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +fltk.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install fltk.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'fluid',
    'fltk-config',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'libjpeg-turbo.org^2',
    'libpng.org^1',
    'linux:x.org/xft^2',
    'linux:x.org/xt^1',
    'linux:freedesktop.org/mesa-glu^9',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.4.4',
    '1.4.3',
    '1.4.2',
    '1.4.1',
    '1.3.11',
    '1.3.10',
    '1.3.9',
  ] as const,
  aliases: [] as const,
}

export type FltkorgPackage = typeof fltkorgPackage
