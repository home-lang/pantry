/**
 * **gitui** - Blazing 💥 fast terminal-ui for git written in rust 🦀
 *
 * @domain `crates.io/gitui`
 * @programs `gitui`
 * @version `0.28.0` (15 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/gitui`
 * @dependencies `perl.org`, `openssl.org^1.1`, `zlib.net^1`, ... (+1 more)
 * @buildDependencies `cmake.org@3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiogitui
 * console.log(pkg.name)        // "gitui"
 * console.log(pkg.description) // "Blazing 💥 fast terminal-ui for git written in ..."
 * console.log(pkg.programs)    // ["gitui"]
 * console.log(pkg.versions[0]) // "0.28.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/gitui.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiogituiPackage = {
  /**
   * The display name of this package.
   */
  name: 'gitui' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/gitui' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Blazing 💥 fast terminal-ui for git written in rust 🦀' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/gitui/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/extrawurst/gitui' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/gitui' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/gitui -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/gitui' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'gitui',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'perl.org',
    'openssl.org^1.1',
    'zlib.net^1',
    'libgit2.org~1.7 # links to libgit2.so.1.7',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org@3',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.28.0',
    '0.27.0',
    '0.26.3',
    '0.26.2',
    '0.26.1',
    '0.26.0',
    '0.25.2',
    '0.25.1',
    '0.25.0',
    '0.24.3',
    '0.24.2',
    '0.24.1',
    '0.24.0',
    '0.23.0',
    '0.22.1',
  ] as const,
  aliases: [] as const,
}

export type CratesiogituiPackage = typeof cratesiogituiPackage
