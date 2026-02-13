/**
 * **yazi** - 💥 Blazing fast terminal file manager written in Rust, based on async I/O.
 *
 * @domain `github.com/sxyazi/yazi`
 * @programs `yazi`
 * @version `26.1.22` (25 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/sxyazi/yazi`
 * @homepage https://yazi-rs.github.io
 * @dependencies `stedolan.github.io/jq`, `poppler.freedesktop.org`, `crates.io/fd-find`, ... (+3 more)
 * @buildDependencies `llvm.org@<17`, `gnu.org/make` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomsxyaziyazi
 * console.log(pkg.name)        // "yazi"
 * console.log(pkg.description) // "💥 Blazing fast terminal file manager written i..."
 * console.log(pkg.programs)    // ["yazi"]
 * console.log(pkg.versions[0]) // "26.1.22" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/sxyazi/yazi.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const yaziPackage = {
  /**
   * The display name of this package.
   */
  name: 'yazi' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/sxyazi/yazi' as const,
  /**
   * Brief description of what this package does.
   */
  description: '💥 Blazing fast terminal file manager written in Rust, based on async I/O.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/sxyazi/yazi/package.yml' as const,
  homepageUrl: 'https://yazi-rs.github.io' as const,
  githubUrl: 'https://github.com/sxyazi/yazi' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/sxyazi/yazi' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/sxyazi/yazi -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/sxyazi/yazi' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'yazi',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'stedolan.github.io/jq',
    'poppler.freedesktop.org',
    'crates.io/fd-find',
    'crates.io/ripgrep',
    'github.com/junegunn/fzf',
    'crates.io/zoxide',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'llvm.org@<17',
    'gnu.org/make',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '26.1.22',
    '26.1.4',
    '25.12.29',
    '25.5.31',
    '25.5.28',
    '25.4.8',
    '25.3.2',
    '25.2.26',
    '25.2.11',
    '25.2.7',
    '0.4.2',
    '0.4.1',
    '0.4.0',
    '0.3.3',
    '0.3.2',
    '0.3.1',
    '0.3.0',
    '0.2.5',
    '0.2.4',
    '0.2.3',
    '0.2.2',
    '0.2.1',
    '0.2.0',
    '0.1.5',
    '0.1.4',
  ] as const,
  aliases: [] as const,
}

export type YaziPackage = typeof yaziPackage
