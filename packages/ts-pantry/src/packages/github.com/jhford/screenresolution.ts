/**
 * **screenresolution** - Command line utility for getting, setting and listing display resolution on Mac OS X 10.6+
 *
 * @domain `github.com/jhford/screenresolution`
 * @programs `screenresolution`
 * @version `1.6.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/jhford/screenresolution`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomjhfordscreenresolution
 * console.log(pkg.name)        // "screenresolution"
 * console.log(pkg.description) // "Command line utility for getting, setting and l..."
 * console.log(pkg.programs)    // ["screenresolution"]
 * console.log(pkg.versions[0]) // "1.6.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/jhford/screenresolution.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const screenresolutionPackage = {
  /**
   * The display name of this package.
   */
  name: 'screenresolution' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/jhford/screenresolution' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Command line utility for getting, setting and listing display resolution on Mac OS X 10.6+' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/jhford/screenresolution/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/jhford/screenresolution' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/jhford/screenresolution' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/jhford/screenresolution -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/jhford/screenresolution' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'screenresolution',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.6.0',
  ] as const,
  aliases: [] as const,
}

export type ScreenresolutionPackage = typeof screenresolutionPackage
