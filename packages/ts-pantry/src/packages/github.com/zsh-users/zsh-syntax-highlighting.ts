/**
 * **zsh-syntax-highlighting** - Fish shell like syntax highlighting for Zsh.
 *
 * @domain `github.com/zsh-users/zsh-syntax-highlighting`
 * @version `0.8.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/zsh-users/zsh-syntax-highlighting`
 * @homepage github.com/zsh-users/zsh-syntax-highlighting
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomzshuserszshsyntaxhighlighting
 * console.log(pkg.name)        // "zsh-syntax-highlighting"
 * console.log(pkg.description) // "Fish shell like syntax highlighting for Zsh."
 * console.log(pkg.versions[0]) // "0.8.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/zsh-users/zsh-syntax-highlighting.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const zshsyntaxhighlightingPackage = {
  /**
   * The display name of this package.
   */
  name: 'zsh-syntax-highlighting' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/zsh-users/zsh-syntax-highlighting' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Fish shell like syntax highlighting for Zsh.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/zsh-users/zsh-syntax-highlighting/package.yml' as const,
  homepageUrl: 'github.com/zsh-users/zsh-syntax-highlighting' as const,
  githubUrl: 'https://github.com/zsh-users/zsh-syntax-highlighting' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/zsh-users/zsh-syntax-highlighting' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/zsh-users/zsh-syntax-highlighting -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/zsh-users/zsh-syntax-highlighting' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.8.0',
    '0.7.1',
  ] as const,
  aliases: [] as const,
}

export type ZshsyntaxhighlightingPackage = typeof zshsyntaxhighlightingPackage
