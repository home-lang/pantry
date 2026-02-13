/**
 * **aspell** - Spell checker with better logic than ispell
 *
 * @domain `aspell.net`
 * @programs `aspell`, `aspell-import`, `precat`, `preunzip`, `prezip`, ... (+4 more)
 * @version `0.60.8.1` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install aspell.net`
 * @homepage http://aspell.net/
 * @buildDependencies `curl.se`, `gnu.org/patch`, `gnu.org/sed`, ... (+1 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.aspellnet
 * console.log(pkg.name)        // "aspell"
 * console.log(pkg.description) // "Spell checker with better logic than ispell"
 * console.log(pkg.programs)    // ["aspell", "aspell-import", ...]
 * console.log(pkg.versions[0]) // "0.60.8.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/aspell-net.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const aspellnetPackage = {
  /**
   * The display name of this package.
   */
  name: 'aspell' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'aspell.net' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Spell checker with better logic than ispell' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/aspell.net/package.yml' as const,
  homepageUrl: 'http://aspell.net/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install aspell.net' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +aspell.net -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install aspell.net' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'aspell',
    'aspell-import',
    'precat',
    'preunzip',
    'prezip',
    'prezip-bin',
    'pspell-config',
    'run-with-aspell',
    'word-list-compress',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'curl.se',
    'gnu.org/patch',
    'gnu.org/sed',
    'sourceware.org/bzip2',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.60.8.1',
    '0.60.8',
  ] as const,
  aliases: [] as const,
}

export type AspellnetPackage = typeof aspellnetPackage
