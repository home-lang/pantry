/**
 * **lazygit** - simple terminal UI for git commands
 *
 * @domain `github.com/jesseduffield/lazygit`
 * @programs `lazygit`
 * @version `0.58.1` (38 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/jesseduffield/lazygit`
 * @dependencies `git-scm.org^2`
 * @buildDependencies `go.dev@^1.18` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomjesseduffieldlazygit
 * console.log(pkg.name)        // "lazygit"
 * console.log(pkg.description) // "simple terminal UI for git commands"
 * console.log(pkg.programs)    // ["lazygit"]
 * console.log(pkg.versions[0]) // "0.58.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/jesseduffield/lazygit.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const lazygitPackage = {
  /**
   * The display name of this package.
   */
  name: 'lazygit' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/jesseduffield/lazygit' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'simple terminal UI for git commands' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/jesseduffield/lazygit/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/jesseduffield/lazygit' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/jesseduffield/lazygit' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/jesseduffield/lazygit -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/jesseduffield/lazygit' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'lazygit',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'git-scm.org^2',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.18',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.58.1',
    '0.58.0',
    '0.57.0',
    '0.56.0',
    '0.55.1',
    '0.55.0',
    '0.54.2',
    '0.54.1',
    '0.54.0',
    '0.53.1',
    '0.53.0',
    '0.52.0',
    '0.51.1',
    '0.51.0',
    '0.50.0',
    '0.49.0',
    '0.48.0',
    '0.47.2',
    '0.47.1',
    '0.46.0',
    '0.45.2',
    '0.45.0',
    '0.44.1',
    '0.44.0',
    '0.43.1',
    '0.43.0',
    '0.42.0',
    '0.41.0',
    '0.40.2',
    '0.40.0',
    '0.39.4',
    '0.39.3',
    '0.39.2',
    '0.39.1',
    '0.38.2',
    '0.38.1',
    '0.38.0',
    '0.37.0',
  ] as const,
  aliases: [] as const,
}

export type LazygitPackage = typeof lazygitPackage
