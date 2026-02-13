/**
 * **dialog** - Display user-friendly message boxes from shell scripts
 *
 * @domain `invisible-island.net/dialog`
 * @programs `dialog`, `dialog-config`
 * @version `1.3.20230209` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install invisible-island.net/dialog`
 * @homepage https://invisible-island.net/dialog/
 * @dependencies `invisible-island.net/ncurses`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.invisibleislandnetdialog
 * console.log(pkg.name)        // "dialog"
 * console.log(pkg.description) // "Display user-friendly message boxes from shell ..."
 * console.log(pkg.programs)    // ["dialog", "dialog-config"]
 * console.log(pkg.versions[0]) // "1.3.20230209" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/invisible-island-net/dialog.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const invisibleislandnetdialogPackage = {
  /**
   * The display name of this package.
   */
  name: 'dialog' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'invisible-island.net/dialog' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Display user-friendly message boxes from shell scripts' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/invisible-island.net/dialog/package.yml' as const,
  homepageUrl: 'https://invisible-island.net/dialog/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install invisible-island.net/dialog' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +invisible-island.net/dialog -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install invisible-island.net/dialog' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'dialog',
    'dialog-config',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'invisible-island.net/ncurses',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.3.20230209',
  ] as const,
  aliases: [] as const,
}

export type InvisibleislandnetdialogPackage = typeof invisibleislandnetdialogPackage
