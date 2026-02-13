/**
 * **nex** - 44BSD re-implementation of vi
 *
 * @domain `github.com/blynn/nex`
 * @programs `nex`
 * @version `2021.3.30` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/blynn/nex`
 * @homepage https://repo.or.cz/nvi.git
 * @buildDependencies `rsync.samba.org`, `go.dev@^1.20` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomblynnnex
 * console.log(pkg.name)        // "nex"
 * console.log(pkg.description) // "44BSD re-implementation of vi"
 * console.log(pkg.programs)    // ["nex"]
 * console.log(pkg.versions[0]) // "2021.3.30" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/blynn/nex.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const nexPackage = {
  /**
   * The display name of this package.
   */
  name: 'nex' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/blynn/nex' as const,
  /**
   * Brief description of what this package does.
   */
  description: '44BSD re-implementation of vi' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/blynn/nex/package.yml' as const,
  homepageUrl: 'https://repo.or.cz/nvi.git' as const,
  githubUrl: 'https://github.com/blynn/nex' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/blynn/nex' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/blynn/nex -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/blynn/nex' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'nex',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'rsync.samba.org',
    'go.dev@^1.20',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2021.3.30',
  ] as const,
  aliases: [] as const,
}

export type NexPackage = typeof nexPackage
