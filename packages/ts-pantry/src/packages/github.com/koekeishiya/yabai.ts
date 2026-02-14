/**
 * **yabai** - A tiling window manager for macOS based on binary space partitioning
 *
 * @domain `github.com/koekeishiya/yabai`
 * @programs `yabai`
 * @version `7.1.16` (31 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/koekeishiya/yabai`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomkoekeishiyayabai
 * console.log(pkg.name)        // "yabai"
 * console.log(pkg.description) // "A tiling window manager for macOS based on bina..."
 * console.log(pkg.programs)    // ["yabai"]
 * console.log(pkg.versions[0]) // "7.1.16" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/koekeishiya/yabai.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const yabaiPackage = {
  /**
  * The display name of this package.
  */
  name: 'yabai' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/koekeishiya/yabai' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A tiling window manager for macOS based on binary space partitioning' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/koekeishiya/yabai/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/koekeishiya/yabai' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/koekeishiya/yabai' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/koekeishiya/yabai -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/koekeishiya/yabai' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'yabai',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '7.1.16',
    '7.1.15',
    '7.1.14',
    '7.1.13',
    '7.1.12',
    '7.1.11',
    '7.1.10',
    '7.1.9',
    '7.1.8',
    '7.1.7',
    '7.1.6',
    '7.1.5',
    '7.1.4',
    '7.1.3',
    '7.1.2',
    '7.1.1',
    '7.1.0',
    '7.0.4',
    '7.0.3',
    '7.0.2',
    '7.0.1',
    '7.0.0',
    '6.0.15',
    '6.0.14',
    '6.0.13',
    '6.0.12',
    '6.0.11',
    '6.0.10',
    '6.0.9',
    '6.0.8',
    '6.0.7',
  ] as const,
  aliases: [] as const,
}

export type YabaiPackage = typeof yabaiPackage
