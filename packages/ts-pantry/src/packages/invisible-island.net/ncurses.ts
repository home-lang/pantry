/**
 * **ncurses** - Text-based UI library
 *
 * @domain `invisible-island.net/ncurses`
 * @programs `captoinfo`, `clear`, `infocmp`, `infotocap`, `ncursesw6-config`, ... (+6 more)
 * @version `6.6.0` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install invisible-island.net/ncurses`
 * @homepage https://invisible-island.net/ncurses/announce.html
 * @buildDependencies `github.com/tmux/tmux@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.invisibleislandnetncurses
 * console.log(pkg.name)        // "ncurses"
 * console.log(pkg.description) // "Text-based UI library"
 * console.log(pkg.programs)    // ["captoinfo", "clear", ...]
 * console.log(pkg.versions[0]) // "6.6.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/invisible-island-net/ncurses.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const invisibleislandnetncursesPackage = {
  /**
   * The display name of this package.
   */
  name: 'ncurses' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'invisible-island.net/ncurses' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Text-based UI library' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/invisible-island.net/ncurses/package.yml' as const,
  homepageUrl: 'https://invisible-island.net/ncurses/announce.html' as const,
  githubUrl: 'https://github.com/mirror/ncurses' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install invisible-island.net/ncurses' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +invisible-island.net/ncurses -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install invisible-island.net/ncurses' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'captoinfo',
    'clear',
    'infocmp',
    'infotocap',
    'ncursesw6-config',
    'reset',
    'tabs',
    'tic',
    'toe',
    'tput',
    'tset',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'github.com/tmux/tmux@^3',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '6.6.0',
    '6.5.0',
    '6.4.0',
    '6.3.0',
  ] as const,
  aliases: [] as const,
}

export type InvisibleislandnetncursesPackage = typeof invisibleislandnetncursesPackage
