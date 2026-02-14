/**
 * **needs** - pkgx package
 *
 * @domain `github.com/NQMVD/needs`
 * @version `0.8.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/NQMVD/needs`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomnqmvdneeds
 * console.log(pkg.name)        // "needs"
 * console.log(pkg.versions[0]) // "0.8.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/NQMVD/needs.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const needsPackage = {
  /**
  * The display name of this package.
  */
  name: 'needs' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/NQMVD/needs' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/NQMVD/needs/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/NQMVD/needs' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/NQMVD/needs -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/NQMVD/needs' as const,
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
    '0.6.0',
  ] as const,
  aliases: [] as const,
}

export type NeedsPackage = typeof needsPackage
