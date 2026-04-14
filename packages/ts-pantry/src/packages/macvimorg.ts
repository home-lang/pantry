/**
 * **macvim** - Vim - the text editor - for macOS
 *
 * @domain `macvim.org`
 * @programs `gview`, `gvim`, `gvimdiff`, `gvimtutor`, `mview`, ... (+7 more)
 * @version `182.0.0` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install macvim.org`
 * @homepage https://macvim.org
 * @dependencies `cscope.sourceforge.io`, `invisible-island.net/ncurses`, `lua.org`, ... (+4 more)
 * @buildDependencies `gnu.org/make` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.macvimorg
 * console.log(pkg.name)        // "macvim"
 * console.log(pkg.description) // "Vim - the text editor - for macOS"
 * console.log(pkg.programs)    // ["gview", "gvim", ...]
 * console.log(pkg.versions[0]) // "182.0.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/macvim-org.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const macvimorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'macvim' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'macvim.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Vim - the text editor - for macOS' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/macvim.org/package.yml' as const,
  homepageUrl: 'https://macvim.org' as const,
  githubUrl: 'https://github.com/macvim-dev/macvim' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install macvim.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +macvim.org -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install macvim.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'gview',
    'gvim',
    'gvimdiff',
    'gvimtutor',
    'mview',
    'mvim',
    'mvimdiff',
    'mvimtutor',
    'view',
    'vim',
    'vimdiff',
    'vimtutor',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'cscope.sourceforge.io',
    'invisible-island.net/ncurses',
    'lua.org',
    'python.org~3.11',
    'ruby-lang.org',
    'libsodium.org',
    'gnu.org/gettext',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/make',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '183',
    '182',
    '182.0.0',
    '181',
    '181.0.0',
    '180',
    '180.0.0',
    '179',
    '179.0.0',
    '178',
    '178.0.0',
    '177',
    '177.0.0',
    '176',
    '174',
  ] as const,
  aliases: [] as const,
}

export type MacvimorgPackage = typeof macvimorgPackage
