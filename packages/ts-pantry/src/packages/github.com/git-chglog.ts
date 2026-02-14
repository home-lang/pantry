/**
 * **git-chglog** - CHANGELOG generator implemented in Go (Golang).
 *
 * @domain `github.com/git-chglog`
 * @programs `git-chglog`
 * @version `0.15.4` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/git-chglog`
 * @homepage https://godoc.org/github.com/git-chglog/git-chglog
 * @buildDependencies `go.dev@^1.19` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomgitchglog
 * console.log(pkg.name)        // "git-chglog"
 * console.log(pkg.description) // "CHANGELOG generator implemented in Go (Golang)."
 * console.log(pkg.programs)    // ["git-chglog"]
 * console.log(pkg.versions[0]) // "0.15.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/git-chglog.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gitchglogPackage = {
  /**
  * The display name of this package.
  */
  name: 'git-chglog' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/git-chglog' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'CHANGELOG generator implemented in Go (Golang).' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/git-chglog/package.yml' as const,
  homepageUrl: 'https://godoc.org/github.com/git-chglog/git-chglog' as const,
  githubUrl: 'https://github.com/git-chglog/git-chglog' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/git-chglog' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/git-chglog -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/git-chglog' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'git-chglog',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.19',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.15.4',
  ] as const,
  aliases: [] as const,
}

export type GitchglogPackage = typeof gitchglogPackage
