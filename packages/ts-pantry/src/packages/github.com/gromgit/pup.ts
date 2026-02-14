/**
 * **pup** - pkgx package
 *
 * @domain `github.com/gromgit/pup`
 * @version `0.4.2` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/gromgit/pup`
 * @buildDependencies `go.dev@^1.23` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomgromgitpup
 * console.log(pkg.name)        // "pup"
 * console.log(pkg.versions[0]) // "0.4.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/gromgit/pup.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pupPackage = {
  /**
  * The display name of this package.
  */
  name: 'pup' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/gromgit/pup' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/gromgit/pup/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/gromgit/pup' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/gromgit/pup -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/gromgit/pup' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.23',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.4.2',
  ] as const,
  aliases: [] as const,
}

export type PupPackage = typeof pupPackage
