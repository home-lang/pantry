/**
 * **chezmoi** - Manage your dotfiles across multiple diverse machines, securely.
 *
 * @domain `chezmoi.io`
 * @programs `chezmoi`
 * @version `2.69.3` (94 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install chezmoi.io`
 * @homepage https://chezmoi.io/
 * @buildDependencies `go.dev@^1.18`, `linux:gnu.org/gcc`, `linux:gnu.org/binutils` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.chezmoiio
 * console.log(pkg.name)        // "chezmoi"
 * console.log(pkg.description) // "Manage your dotfiles across multiple diverse ma..."
 * console.log(pkg.programs)    // ["chezmoi"]
 * console.log(pkg.versions[0]) // "2.69.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/chezmoi-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const chezmoiioPackage = {
  /**
   * The display name of this package.
   */
  name: 'chezmoi' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'chezmoi.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Manage your dotfiles across multiple diverse machines, securely.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/chezmoi.io/package.yml' as const,
  homepageUrl: 'https://chezmoi.io/' as const,
  githubUrl: 'https://github.com/twpayne/chezmoi' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install chezmoi.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +chezmoi.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install chezmoi.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'chezmoi',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'go.dev@^1.18',
    'linux:gnu.org/gcc',
    'linux:gnu.org/binutils',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.69.3',
    '2.69.2',
    '2.69.1',
    '2.69.0',
    '2.68.1',
    '2.68.0',
    '2.67.1',
    '2.67.0',
    '2.66.2',
    '2.66.1',
    '2.66.0',
    '2.65.2',
    '2.65.1',
    '2.65.0',
    '2.64.0',
    '2.63.1',
    '2.63.0',
    '2.62.7',
    '2.62.6',
    '2.62.5',
    '2.62.4',
    '2.62.3',
    '2.62.2',
    '2.62.1',
    '2.62.0',
    '2.61.0',
    '2.60.1',
    '2.60.0',
    '2.59.1',
    '2.59.0',
    '2.58.0',
    '2.57.0',
    '2.56.0',
    '2.55.0',
    '2.54.0',
    '2.53.1',
    '2.53.0',
    '2.52.4',
    '2.52.3',
    '2.52.2',
    '2.52.1',
    '2.52.0',
    '2.51.0',
    '2.50.0',
    '2.49.1',
    '2.49.0',
    '2.48.2',
    '2.48.1',
    '2.48.0',
    '2.47.4',
    '2.47.3',
    '2.47.2',
    '2.47.1',
    '2.47.0',
    '2.46.1',
    '2.46.0',
    '2.45.0',
    '2.44.0',
    '2.43.0',
    '2.42.3',
    '2.42.2',
    '2.42.1',
    '2.42.0',
    '2.41.0',
    '2.40.4',
    '2.40.3',
    '2.40.2',
    '2.40.1',
    '2.40.0',
    '2.39.1',
    '2.39.0',
    '2.36.1',
    '2.36.0',
    '2.35.2',
    '2.35.1',
    '2.35.0',
    '2.34.3',
    '2.34.2',
    '2.34.1',
    '2.34.0',
    '2.33.6',
    '2.33.5',
    '2.33.4',
    '2.33.3',
    '2.33.2',
    '2.33.1',
    '2.33.0',
    '2.32.0',
    '2.31.1',
    '2.31.0',
    '2.30.1',
    '2.30.0',
    '2.29.4',
    '2.29.3',
  ] as const,
  aliases: [] as const,
}

export type ChezmoiioPackage = typeof chezmoiioPackage
