/**
 * **podlet** - pkgx package
 *
 * @domain `github.com/containers/podlet`
 * @version `0.3.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/containers/podlet`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomcontainerspodlet
 * console.log(pkg.name)        // "podlet"
 * console.log(pkg.versions[0]) // "0.3.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/containers/podlet.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const podletPackage = {
  /**
   * The display name of this package.
   */
  name: 'podlet' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/containers/podlet' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/containers/podlet/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/containers/podlet' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/containers/podlet -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/containers/podlet' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.3.0',
  ] as const,
  aliases: [] as const,
}

export type PodletPackage = typeof podletPackage
