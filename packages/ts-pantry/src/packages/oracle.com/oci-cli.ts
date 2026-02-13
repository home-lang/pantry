/**
 * **oci** - Command Line Interface for Oracle Cloud Infrastructure
 *
 * @domain `oracle.com/oci-cli`
 * @programs `oci`
 * @version `3.72.1` (93 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install oracle.com/oci-cli`
 * @homepage https://docs.cloud.oracle.com/iaas/Content/API/Concepts/cliconcepts.htm
 * @dependencies `certifi.io/python-certifi^2024`, `pyyaml.org/libyaml^0.2`, `cryptography.io^42`, ... (+1 more)
 * @buildDependencies `cmake.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.oraclecomocicli
 * console.log(pkg.name)        // "oci"
 * console.log(pkg.description) // "Command Line Interface for Oracle Cloud Infrast..."
 * console.log(pkg.programs)    // ["oci"]
 * console.log(pkg.versions[0]) // "3.72.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/oracle-com/oci-cli.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const oraclecomocicliPackage = {
  /**
   * The display name of this package.
   */
  name: 'oci' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'oracle.com/oci-cli' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Command Line Interface for Oracle Cloud Infrastructure' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/oracle.com/oci-cli/package.yml' as const,
  homepageUrl: 'https://docs.cloud.oracle.com/iaas/Content/API/Concepts/cliconcepts.htm' as const,
  githubUrl: 'https://github.com/oracle/oci-cli' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install oracle.com/oci-cli' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +oracle.com/oci-cli -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install oracle.com/oci-cli' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'oci',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'certifi.io/python-certifi^2024',
    'pyyaml.org/libyaml^0.2',
    'cryptography.io^42',
    'python.org^3.11',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.72.1',
    '3.72.0',
    '3.71.4',
    '3.71.2',
    '3.71.1',
    '3.71.0',
    '3.70.1',
    '3.70.0',
    '3.69.0',
    '3.68.1',
    '3.68.0',
    '3.67.0',
    '3.66.2',
    '3.66.1',
    '3.66.0',
    '3.65.1',
    '3.65.0',
    '3.64.1',
    '3.64.0',
    '3.63.3',
    '3.63.2',
    '3.63.0',
    '3.62.2',
    '3.62.1',
    '3.62.0',
    '3.61.0',
    '3.60.0',
    '3.59.0',
    '3.58.1',
    '3.58.0',
    '3.57.0',
    '3.56.1',
    '3.56.0',
    '3.55.0',
    '3.54.6',
    '3.54.5',
    '3.54.4',
    '3.54.3',
    '3.54.2',
    '3.54.1',
    '3.54.0',
    '3.53.0',
    '3.52.1',
    '3.52.0',
    '3.51.9',
    '3.51.8',
    '3.51.7',
    '3.51.6',
    '3.51.5',
    '3.51.4',
    '3.51.3',
    '3.51.2',
    '3.51.1',
    '3.51.0',
    '3.50.3',
    '3.50.2',
    '3.50.1',
    '3.50.0',
    '3.49.4',
    '3.49.3',
    '3.49.2',
    '3.49.1',
    '3.49.0',
    '3.48.3',
    '3.48.2',
    '3.48.1',
    '3.48.0',
    '3.47.0',
    '3.46.0',
    '3.45.2',
    '3.45.1',
    '3.45.0',
    '3.44.4',
    '3.44.3',
    '3.44.2',
    '3.44.1',
    '3.44.0',
    '3.43.2',
    '3.43.1',
    '3.43.0',
    '3.42.0',
    '3.41.0',
    '3.40.3',
    '3.40.2',
    '3.40.1',
    '3.40.0',
    '3.39.1',
    '3.39.0',
    '3.38.1',
    '3.38.0',
    '3.37.14',
    '3.37.13',
    '3.37.12',
  ] as const,
  aliases: [] as const,
}

export type OraclecomocicliPackage = typeof oraclecomocicliPackage
