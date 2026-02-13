/**
 * **fish** - User-friendly command-line shell for UNIX-like operating systems
 *
 * @domain `fishshell.com`
 * @programs `fish`, `fish_indent`, `fish_key_reader`
 * @version `4.3.3` (23 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install fishshell.com`
 * @homepage https://fishshell.com
 * @dependencies `gnu.org/gettext`, `invisible-island.net/ncurses>=6.0`
 * @buildDependencies `cmake.org@>=3.5`, `gnu.org/patch` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.fishshellcom
 * console.log(pkg.name)        // "fish"
 * console.log(pkg.description) // "User-friendly command-line shell for UNIX-like ..."
 * console.log(pkg.programs)    // ["fish", "fish_indent", ...]
 * console.log(pkg.versions[0]) // "4.3.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/fishshell-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const fishshellcomPackage = {
  /**
   * The display name of this package.
   */
  name: 'fish' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'fishshell.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'User-friendly command-line shell for UNIX-like operating systems' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/fishshell.com/package.yml' as const,
  homepageUrl: 'https://fishshell.com' as const,
  githubUrl: 'https://github.com/fish-shell/fish-shell' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install fishshell.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +fishshell.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install fishshell.com' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'fish',
    'fish_indent',
    'fish_key_reader',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'gnu.org/gettext',
    'invisible-island.net/ncurses>=6.0',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org@>=3.5',
    'gnu.org/patch',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '4.3.3',
    '4.3.2',
    '4.3.1',
    '4.3.0',
    '4.2.1',
    '4.2.0',
    '4.1.2',
    '4.1.1',
    '4.1.0',
    '4.0.9',
    '4.0.8',
    '4.0.6',
    '4.0.2',
    '4.0.1',
    '4.0.0',
    '3.7.1',
    '3.7.0',
    '3.6.4',
    '3.6.3',
    '3.6.2',
    '3.6.1',
    '3.6.0',
    '3.5.1',
  ] as const,
  aliases: [] as const,
}

export type FishshellcomPackage = typeof fishshellcomPackage
