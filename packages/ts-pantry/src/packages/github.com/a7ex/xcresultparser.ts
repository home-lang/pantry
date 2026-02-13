/**
 * **xcresultparser** - Parse the binary xcresult bundle from Xcode builds and testruns
 *
 * @domain `github.com/a7ex/xcresultparser`
 * @programs `xcresultparser`
 * @version `1.9.4` (21 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/a7ex/xcresultparser`
 * @buildDependencies `crates.io/semverator` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcoma7exxcresultparser
 * console.log(pkg.name)        // "xcresultparser"
 * console.log(pkg.description) // "Parse the binary xcresult bundle from Xcode bui..."
 * console.log(pkg.programs)    // ["xcresultparser"]
 * console.log(pkg.versions[0]) // "1.9.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/a7ex/xcresultparser.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const xcresultparserPackage = {
  /**
   * The display name of this package.
   */
  name: 'xcresultparser' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/a7ex/xcresultparser' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Parse the binary xcresult bundle from Xcode builds and testruns' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/a7ex/xcresultparser/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/a7ex/xcresultparser' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/a7ex/xcresultparser' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/a7ex/xcresultparser -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/a7ex/xcresultparser' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'xcresultparser',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'crates.io/semverator',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.9.4',
    '1.9.3',
    '1.9.2',
    '1.9.1',
    '1.9.0',
    '1.8.5',
    '1.8.4',
    '1.8.3',
    '1.8.2',
    '1.8.1',
    '1.8.0',
    '1.7.2',
    '1.7.1',
    '1.7.0',
    '1.6.5',
    '1.6.4',
    '1.6.3',
    '1.6.2',
    '1.6.1',
    '1.6.0',
    '1.5.2',
  ] as const,
  aliases: [] as const,
}

export type XcresultparserPackage = typeof xcresultparserPackage
