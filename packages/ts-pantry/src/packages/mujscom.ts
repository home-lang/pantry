/**
 * **mujs** - An embeddable Javascript interpreter in C.
 *
 * @domain `mujs.com`
 * @programs `mujs`, `mujs-pp`
 * @version `1.3.8` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install mujs.com`
 * @homepage https://www.mujs.com/
 * @dependencies `gnu.org/readline~8.1`, `linux:invisible-island.net/ncurses` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `python.org@^3`, `linux:gnu.org/gcc`, `linux:gnu.org/make` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.mujscom
 * console.log(pkg.name)        // "mujs"
 * console.log(pkg.description) // "An embeddable Javascript interpreter in C."
 * console.log(pkg.programs)    // ["mujs", "mujs-pp"]
 * console.log(pkg.versions[0]) // "1.3.8" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/mujs-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const mujscomPackage = {
  /**
  * The display name of this package.
  */
  name: 'mujs' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'mujs.com' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'An embeddable Javascript interpreter in C.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/mujs.com/package.yml' as const,
  homepageUrl: 'https://www.mujs.com/' as const,
  githubUrl: 'https://github.com/ccxvii/mujs' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install mujs.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +mujs.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install mujs.com' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'mujs',
    'mujs-pp',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'gnu.org/readline~8.1',
    'linux:invisible-island.net/ncurses',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'python.org@^3',
    'linux:gnu.org/gcc',
    'linux:gnu.org/make',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.3.8',
    '1.3.7',
    '1.3.6',
    '1.3.5',
    '1.3.4',
    '1.3.3',
  ] as const,
  aliases: [] as const,
}

export type MujscomPackage = typeof mujscomPackage
