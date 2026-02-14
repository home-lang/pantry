/**
 * **nvim** - Ambitious Vim-fork focused on extensibility and agility
 *
 * @domain `neovim.io`
 * @programs `nvim`
 * @version `0.11.6` (19 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install neovim.io`
 * @homepage https://neovim.io/
 * @dependencies `gnu.org/gettext^0`
 * @buildDependencies `cmake.org`, `gnu.org/libtool@^2` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.neovimio
 * console.log(pkg.name)        // "nvim"
 * console.log(pkg.description) // "Ambitious Vim-fork focused on extensibility and..."
 * console.log(pkg.programs)    // ["nvim"]
 * console.log(pkg.versions[0]) // "0.11.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/neovim-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const neovimioPackage = {
  /**
  * The display name of this package.
  */
  name: 'nvim' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'neovim.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Ambitious Vim-fork focused on extensibility and agility' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/neovim.io/package.yml' as const,
  homepageUrl: 'https://neovim.io/' as const,
  githubUrl: 'https://github.com/neovim/neovim' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install neovim.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +neovim.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install neovim.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'nvim',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'gnu.org/gettext^0',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org',
    'gnu.org/libtool@^2',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.11.6',
    '0.11.5',
    '0.11.4',
    '0.11.3',
    '0.11.2',
    '0.11.1',
    '0.11.0',
    '0.10.4',
    '0.10.3',
    '0.10.2',
    '0.10.1',
    '0.10.0',
    '0.9.5',
    '0.9.4',
    '0.9.2',
    '0.9.1',
    '0.9.0',
    '0.8.2',
    '0.8.1',
  ] as const,
  aliases: [] as const,
}

export type NeovimioPackage = typeof neovimioPackage
