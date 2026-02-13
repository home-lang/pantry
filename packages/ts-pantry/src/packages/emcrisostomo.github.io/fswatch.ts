/**
 * **fswatch** - pkgx package
 *
 * @domain `emcrisostomo.github.io/fswatch`
 * @version `1.18.3` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install emcrisostomo.github.io/fswatch`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.emcrisostomogithubiofswatch
 * console.log(pkg.name)        // "fswatch"
 * console.log(pkg.versions[0]) // "1.18.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/emcrisostomo-github-io/fswatch.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const emcrisostomogithubiofswatchPackage = {
  /**
   * The display name of this package.
   */
  name: 'fswatch' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'emcrisostomo.github.io/fswatch' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/emcrisostomo.github.io/fswatch/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install emcrisostomo.github.io/fswatch' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +emcrisostomo.github.io/fswatch -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install emcrisostomo.github.io/fswatch' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.18.3',
  ] as const,
  aliases: [] as const,
}

export type EmcrisostomogithubiofswatchPackage = typeof emcrisostomogithubiofswatchPackage
