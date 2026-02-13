/**
 * **lazydocker** - The lazier way to manage everything docker
 *
 * @domain `github.com/jesseduffield/lazydocker`
 * @programs `lazydocker`
 * @version `0.24.4` (11 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/jesseduffield/lazydocker`
 * @buildDependencies `go.dev@^1.18` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomjesseduffieldlazydocker
 * console.log(pkg.name)        // "lazydocker"
 * console.log(pkg.description) // "The lazier way to manage everything docker"
 * console.log(pkg.programs)    // ["lazydocker"]
 * console.log(pkg.versions[0]) // "0.24.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/jesseduffield/lazydocker.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const lazydockerPackage = {
  /**
   * The display name of this package.
   */
  name: 'lazydocker' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/jesseduffield/lazydocker' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'The lazier way to manage everything docker' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/jesseduffield/lazydocker/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/jesseduffield/lazydocker' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/jesseduffield/lazydocker' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/jesseduffield/lazydocker -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/jesseduffield/lazydocker' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'lazydocker',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
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
    '0.24.4',
    '0.24.3',
    '0.24.2',
    '0.24.1',
    '0.24.0',
    '0.23.3',
    '0.23.1',
    '0.23.0',
    '0.21.1',
    '0.21.0',
    '0.20.0',
  ] as const,
  aliases: [] as const,
}

export type LazydockerPackage = typeof lazydockerPackage
