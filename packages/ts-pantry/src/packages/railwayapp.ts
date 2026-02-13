/**
 * **railway** - Develop and deploy code with zero configuration
 *
 * @domain `railway.app`
 * @programs `railway`
 * @version `4.26.0` (88 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install railway.app`
 * @homepage https://railway.app/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.railwayapp
 * console.log(pkg.name)        // "railway"
 * console.log(pkg.description) // "Develop and deploy code with zero configuration"
 * console.log(pkg.programs)    // ["railway"]
 * console.log(pkg.versions[0]) // "4.26.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/railway-app.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const railwayappPackage = {
  /**
   * The display name of this package.
   */
  name: 'railway' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'railway.app' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Develop and deploy code with zero configuration' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/railway.app/package.yml' as const,
  homepageUrl: 'https://railway.app/' as const,
  githubUrl: 'https://github.com/railwayapp/cli' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install railway.app' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +railway.app -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install railway.app' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'railway',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '4.26.0',
    '4.25.3',
    '4.25.2',
    '4.25.1',
    '4.25.0',
    '4.24.0',
    '4.23.2',
    '4.23.1',
    '4.23.0',
    '4.22.0',
    '4.21.0',
    '4.20.0',
    '4.19.0',
    '4.18.2',
    '4.18.1',
    '4.18.0',
    '4.17.1',
    '4.17.0',
    '4.16.1',
    '4.16.0',
    '4.15.1',
    '4.15.0',
    '4.14.0',
    '4.12.0',
    '4.11.2',
    '4.11.1',
    '4.11.0',
    '4.10.0',
    '4.9.0',
    '4.8.0',
    '4.7.3',
    '4.6.3',
    '4.6.1',
    '4.6.0',
    '4.5.6',
    '4.5.5',
    '4.5.4',
    '4.5.3',
    '4.5.2',
    '4.5.1',
    '4.5.0',
    '4.4.1',
    '4.4.0',
    '4.3.0',
    '4.2.0',
    '4.1.0',
    '4.0.1',
    '4.0.0',
    '3.23.0',
    '3.22.2',
    '3.22.0',
    '3.21.0',
    '3.20.2',
    '3.20.1',
    '3.20.0',
    '3.19.1',
    '3.19.0',
    '3.18.0',
    '3.17.10',
    '3.17.9',
    '3.17.8',
    '3.17.7',
    '3.17.6',
    '3.17.1',
    '3.17.0',
    '3.15.3',
    '3.15.2',
    '3.15.1',
    '3.14.1',
    '3.14.0',
    '3.13.0',
    '3.12.2',
    '3.12.1',
    '3.12.0',
    '3.11.4',
    '3.11.2',
    '3.11.1',
    '3.11.0',
    '3.10.0',
    '3.9.3',
    '3.9.0',
    '3.8.2',
    '3.8.1',
    '3.8.0',
    '3.7.2',
    '3.7.0',
    '3.6.0',
    '3.5.2',
  ] as const,
  aliases: [] as const,
}

export type RailwayappPackage = typeof railwayappPackage
