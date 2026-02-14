/**
 * **nano** - Free (GNU) replacement for the Pico text editor
 *
 * @domain `nano-editor.org`
 * @programs `nano`
 * @version `8.0.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install nano-editor.org`
 * @homepage https://www.nano-editor.org/
 * @dependencies `gnu.org/gettext`, `invisible-island.net/ncurses>=6.0`
 * @buildDependencies `gnu.org/automake@^1.16`, `gnu.org/make` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.nanoeditororg
 * console.log(pkg.name)        // "nano"
 * console.log(pkg.description) // "Free (GNU) replacement for the Pico text editor"
 * console.log(pkg.programs)    // ["nano"]
 * console.log(pkg.versions[0]) // "8.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/nano-editor-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const nanoeditororgPackage = {
  /**
  * The display name of this package.
  */
  name: 'nano' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'nano-editor.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Free (GNU) replacement for the Pico text editor' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/nano-editor.org/package.yml' as const,
  homepageUrl: 'https://www.nano-editor.org/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install nano-editor.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +nano-editor.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install nano-editor.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'nano',
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
    'gnu.org/automake@^1.16',
    'gnu.org/make',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '8.0.0',
    '7.2.0',
  ] as const,
  aliases: [] as const,
}

export type NanoeditororgPackage = typeof nanoeditororgPackage
