/**
 * **rucio-client** - Rucio - Scientific Data Management
 *
 * @domain `rucio.cern.ch/rucio-client`
 * @programs `rucio`, `rucio-admin`
 * @version `39.1.0` (42 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install rucio.cern.ch/rucio-client`
 * @homepage http://rucio.cern.ch
 * @dependencies `pkgx.sh^1`
 * @buildDependencies `gnu.org/bash@^5`, `python.org@>=3.9<3.13`, `postgresql.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.ruciocernchrucioclient
 * console.log(pkg.name)        // "rucio-client"
 * console.log(pkg.description) // "Rucio - Scientific Data Management"
 * console.log(pkg.programs)    // ["rucio", "rucio-admin"]
 * console.log(pkg.versions[0]) // "39.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/rucio-cern-ch/rucio-client.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const ruciocernchrucioclientPackage = {
  /**
   * The display name of this package.
   */
  name: 'rucio-client' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'rucio.cern.ch/rucio-client' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Rucio - Scientific Data Management' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/rucio.cern.ch/rucio-client/package.yml' as const,
  homepageUrl: 'http://rucio.cern.ch' as const,
  githubUrl: 'https://github.com/rucio/rucio' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install rucio.cern.ch/rucio-client' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +rucio.cern.ch/rucio-client -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install rucio.cern.ch/rucio-client' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'rucio',
    'rucio-admin',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'pkgx.sh^1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/bash@^5',
    'python.org@>=3.9<3.13',
    'postgresql.org',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '39.1.0',
    '39.0.0',
    '38.5.1',
    '38.5.0',
    '38.4.0',
    '38.3.0',
    '38.2.0',
    '38.1.0',
    '38.0.0',
    '37.7.1',
    '37.7.0',
    '37.6.0',
    '37.5.0',
    '37.4.0',
    '37.3.0',
    '37.2.0',
    '37.1.0',
    '37.0.0',
    '36.5.0',
    '36.4.0',
    '36.3.0',
    '36.2.0',
    '36.1.0',
    '35.8.2',
    '35.8.1',
    '35.8.0',
    '35.7.0',
    '35.6.1',
    '35.6.0',
    '35.5.0',
    '35.4.1',
    '35.4.0',
    '35.3.0',
    '35.2.1',
    '35.2.0',
    '35.1.1',
    '35.1.0',
    '35.0.1',
    '35.0.0',
    '34.6.0',
    '34.5.0',
    '34.4.3',
  ] as const,
  aliases: [] as const,
}

export type RuciocernchrucioclientPackage = typeof ruciocernchrucioclientPackage
