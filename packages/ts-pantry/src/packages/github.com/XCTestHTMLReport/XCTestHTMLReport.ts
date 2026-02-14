/**
 * **xchtmlreport** - Xcode-like HTML report for Unit and UI Tests
 *
 * @domain `github.com/XCTestHTMLReport/XCTestHTMLReport`
 * @programs `xchtmlreport`
 * @version `2.5.1` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/XCTestHTMLReport/XCTestHTMLReport`
 * @buildDependencies `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomxctesthtmlreportxctesthtmlreport
 * console.log(pkg.name)        // "xchtmlreport"
 * console.log(pkg.description) // "Xcode-like HTML report for Unit and UI Tests"
 * console.log(pkg.programs)    // ["xchtmlreport"]
 * console.log(pkg.versions[0]) // "2.5.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/XCTestHTMLReport/XCTestHTMLReport.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const xctesthtmlreportPackage = {
  /**
  * The display name of this package.
  */
  name: 'xchtmlreport' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/XCTestHTMLReport/XCTestHTMLReport' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Xcode-like HTML report for Unit and UI Tests' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/XCTestHTMLReport/XCTestHTMLReport/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/XCTestHTMLReport/XCTestHTMLReport' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/XCTestHTMLReport/XCTestHTMLReport' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/XCTestHTMLReport/XCTestHTMLReport -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/XCTestHTMLReport/XCTestHTMLReport' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'xchtmlreport',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'curl.se',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.5.1',
    '2.5.0',
    '2.4.2',
  ] as const,
  aliases: [] as const,
}

export type XctesthtmlreportPackage = typeof xctesthtmlreportPackage
