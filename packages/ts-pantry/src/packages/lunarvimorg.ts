/**
 * **lunarvim** - 🌙 LunarVim is an IDE layer for Neovim. Completely free and community driven.
 *
 * @domain `lunarvim.org`
 * @programs `lvim`, `nvim`
 * @version `1.4.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install lunarvim.org`
 * @homepage https://www.lunarvim.org
 * @dependencies `gnu.org/bash`, `crates.io/fd-find`, `pip.pypa.io`, ... (+4 more)
 * @buildDependencies `cmake.org`, `gnu.org/bash` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.lunarvimorg
 * console.log(pkg.name)        // "lunarvim"
 * console.log(pkg.description) // "🌙 LunarVim is an IDE layer for Neovim. Complet..."
 * console.log(pkg.programs)    // ["lvim", "nvim"]
 * console.log(pkg.versions[0]) // "1.4.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/lunarvim-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const lunarvimorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'lunarvim' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'lunarvim.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: '🌙 LunarVim is an IDE layer for Neovim. Completely free and community driven.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/lunarvim.org/package.yml' as const,
  homepageUrl: 'https://www.lunarvim.org' as const,
  githubUrl: 'https://github.com/LunarVim/LunarVim' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install lunarvim.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +lunarvim.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install lunarvim.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'lvim',
    'nvim',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'gnu.org/bash',
    'crates.io/fd-find',
    'pip.pypa.io',
    'python.org^3',
    'nodejs.org',
    'rust-lang.org/cargo',
    'neovim.io',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org',
    'gnu.org/bash',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.4.0',
    '1.3.0',
  ] as const,
  aliases: [] as const,
}

export type LunarvimorgPackage = typeof lunarvimorgPackage
