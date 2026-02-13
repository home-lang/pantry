/**
 * **reattach-to-user-namespace** - Notes and workarounds for accessing the Mac OS X pasteboard in tmux sessions. Note: The pu branch (“Proposed Updates”) may be rewound without notice.
 *
 * @domain `github.com/ChrisJohnsen/tmux-MacOSX-pasteboard`
 * @programs `reattach-to-user-namespace`
 * @version `2.9.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/ChrisJohnsen/tmux-MacOSX-pasteboard`
 * @buildDependencies `gnu.org/make` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomchrisjohnsentmuxmacosxpasteboard
 * console.log(pkg.name)        // "reattach-to-user-namespace"
 * console.log(pkg.description) // "Notes and workarounds for accessing the Mac OS ..."
 * console.log(pkg.programs)    // ["reattach-to-user-namespace"]
 * console.log(pkg.versions[0]) // "2.9.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/ChrisJohnsen/tmux-MacOSX-pasteboard.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const tmuxmacosxpasteboardPackage = {
  /**
   * The display name of this package.
   */
  name: 'reattach-to-user-namespace' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/ChrisJohnsen/tmux-MacOSX-pasteboard' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Notes and workarounds for accessing the Mac OS X pasteboard in tmux sessions. Note: The pu branch (“Proposed Updates”) may be rewound without notice.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/ChrisJohnsen/tmux-MacOSX-pasteboard/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/ChrisJohnsen/tmux-MacOSX-pasteboard' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/ChrisJohnsen/tmux-MacOSX-pasteboard' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/ChrisJohnsen/tmux-MacOSX-pasteboard -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/ChrisJohnsen/tmux-MacOSX-pasteboard' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'reattach-to-user-namespace',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/make',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.9.0',
  ] as const,
  aliases: [] as const,
}

export type TmuxmacosxpasteboardPackage = typeof tmuxmacosxpasteboardPackage
