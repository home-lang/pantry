/**
 * **sourcekitten** - An adorable little framework and command line tool for interacting with SourceKit.
 *
 * @domain `github.com/jpsim/SourceKitten`
 * @programs `sourcekitten`
 * @version `0.37.2` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/jpsim/SourceKitten`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomjpsimsourcekitten
 * console.log(pkg.name)        // "sourcekitten"
 * console.log(pkg.description) // "An adorable little framework and command line t..."
 * console.log(pkg.programs)    // ["sourcekitten"]
 * console.log(pkg.versions[0]) // "0.37.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/jpsim/SourceKitten.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const sourcekittenPackage = {
  /**
   * The display name of this package.
   */
  name: 'sourcekitten' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/jpsim/SourceKitten' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'An adorable little framework and command line tool for interacting with SourceKit.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/jpsim/SourceKitten/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/jpsim/SourceKitten' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/jpsim/SourceKitten' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/jpsim/SourceKitten -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/jpsim/SourceKitten' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'sourcekitten',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.37.2',
    '0.37.1',
    '0.37.0',
    '0.36.0',
    '0.35.0',
    '0.34.1',
  ] as const,
  aliases: [] as const,
}

export type SourcekittenPackage = typeof sourcekittenPackage
