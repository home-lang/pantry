/**
 * **act** - Run your GitHub Actions locally 🚀
 *
 * @domain `github.com/nektos/act`
 * @programs `act`
 * @version `0.2.84` (42 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/nektos/act`
 * @homepage https://nektosact.com
 * @buildDependencies `go.dev` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomnektosact
 * console.log(pkg.name)        // "act"
 * console.log(pkg.description) // "Run your GitHub Actions locally 🚀"
 * console.log(pkg.programs)    // ["act"]
 * console.log(pkg.versions[0]) // "0.2.84" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/nektos/act.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const actPackage = {
  /**
   * The display name of this package.
   */
  name: 'act' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/nektos/act' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Run your GitHub Actions locally 🚀' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/nektos/act/package.yml' as const,
  homepageUrl: 'https://nektosact.com' as const,
  githubUrl: 'https://github.com/nektos/act' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/nektos/act' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/nektos/act -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/nektos/act' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'act',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.2.84',
    '0.2.83',
    '0.2.82',
    '0.2.81',
    '0.2.80',
    '0.2.79',
    '0.2.78',
    '0.2.77',
    '0.2.76',
    '0.2.75',
    '0.2.74',
    '0.2.73',
    '0.2.72',
    '0.2.71',
    '0.2.70',
    '0.2.69',
    '0.2.68',
    '0.2.67',
    '0.2.66',
    '0.2.65',
    '0.2.64',
    '0.2.63',
    '0.2.62',
    '0.2.61',
    '0.2.60',
    '0.2.59',
    '0.2.58',
    '0.2.57',
    '0.2.56',
    '0.2.55',
    '0.2.54',
    '0.2.53',
    '0.2.52',
    '0.2.51',
    '0.2.50',
    '0.2.49',
    '0.2.48',
    '0.2.47',
    '0.2.46',
    '0.2.45',
    '0.2.44',
    '0.2.43',
  ] as const,
  aliases: [] as const,
}

export type ActPackage = typeof actPackage
