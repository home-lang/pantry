/**
 * **ia** - Python wrapper for the various Internet Archive APIs
 *
 * @domain `github.com/jjjake/internetarchive`
 * @programs `ia`
 * @version `5.7.2` (19 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/jjjake/internetarchive`
 * @dependencies `python.org~3.11`, `gnu.org/which^2 # our stubs use which`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomjjjakeinternetarchive
 * console.log(pkg.name)        // "ia"
 * console.log(pkg.description) // "Python wrapper for the various Internet Archive..."
 * console.log(pkg.programs)    // ["ia"]
 * console.log(pkg.versions[0]) // "5.7.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/jjjake/internetarchive.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const internetarchivePackage = {
  /**
  * The display name of this package.
  */
  name: 'ia' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/jjjake/internetarchive' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Python wrapper for the various Internet Archive APIs' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/jjjake/internetarchive/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/jjjake/internetarchive' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/jjjake/internetarchive' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/jjjake/internetarchive -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/jjjake/internetarchive' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'ia',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'python.org~3.11',
    'gnu.org/which^2 # our stubs use which',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '5.7.2',
    '5.7.1',
    '5.7.0',
    '5.6.1',
    '5.6.0',
    '5.5.1',
    '5.5.0',
    '5.4.1',
    '5.4.0',
    '5.3.0',
    '5.2.1',
    '5.1.0',
    '5.0.5',
    '5.0.3',
    '5.0.0',
    '4.1.0',
    '4.0.1',
    '3.7.0',
    '3.4.0',
  ] as const,
  aliases: [] as const,
}

export type InternetarchivePackage = typeof internetarchivePackage
