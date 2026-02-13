/**
 * **xcodes** - The best command-line tool to install and switch between multiple versions of Xcode.
 *
 * @domain `github.com/XcodesOrg/xcodes`
 * @programs `xcodes`
 * @version `1.6.2` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/XcodesOrg/xcodes`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomxcodesorgxcodes
 * console.log(pkg.name)        // "xcodes"
 * console.log(pkg.description) // "The best command-line tool to install and switc..."
 * console.log(pkg.programs)    // ["xcodes"]
 * console.log(pkg.versions[0]) // "1.6.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/XcodesOrg/xcodes.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const xcodesPackage = {
  /**
   * The display name of this package.
   */
  name: 'xcodes' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/XcodesOrg/xcodes' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'The best command-line tool to install and switch between multiple versions of Xcode.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/XcodesOrg/xcodes/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/XcodesOrg/xcodes' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/XcodesOrg/xcodes' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/XcodesOrg/xcodes -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/XcodesOrg/xcodes' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'xcodes',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.6.2',
    '1.6.1',
    '1.6.0',
    '1.5.0',
    '1.4.1',
  ] as const,
  aliases: [] as const,
}

export type XcodesPackage = typeof xcodesPackage
