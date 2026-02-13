/**
 * **zsh-autosuggestions** - Fish-like autosuggestions for zsh
 *
 * @domain `github.com/zsh-users/zsh-autosuggestions`
 * @version `0.7.1` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/zsh-users/zsh-autosuggestions`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomzshuserszshautosuggestions
 * console.log(pkg.name)        // "zsh-autosuggestions"
 * console.log(pkg.description) // "Fish-like autosuggestions for zsh"
 * console.log(pkg.versions[0]) // "0.7.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/zsh-users/zsh-autosuggestions.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const zshautosuggestionsPackage = {
  /**
   * The display name of this package.
   */
  name: 'zsh-autosuggestions' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/zsh-users/zsh-autosuggestions' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Fish-like autosuggestions for zsh' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/zsh-users/zsh-autosuggestions/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/zsh-users/zsh-autosuggestions' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/zsh-users/zsh-autosuggestions' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/zsh-users/zsh-autosuggestions -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/zsh-users/zsh-autosuggestions' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.7.1',
    '0.7.0',
  ] as const,
  aliases: [] as const,
}

export type ZshautosuggestionsPackage = typeof zshautosuggestionsPackage
