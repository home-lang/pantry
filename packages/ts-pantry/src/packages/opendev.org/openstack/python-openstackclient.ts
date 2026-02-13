/**
 * **openstack** - pkgx package
 *
 * @domain `opendev.org/openstack/python-openstackclient`
 * @programs `openstack`, `openstack-inventory`
 * @version `8.3.0` (23 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install opendev.org/openstack/python-openstackclient`
 * @dependencies `pkgx.sh^1`
 * @buildDependencies `python.org@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.opendevorgopenstackpythonopenstackclient
 * console.log(pkg.name)        // "openstack"
 * console.log(pkg.programs)    // ["openstack", "openstack-inventory"]
 * console.log(pkg.versions[0]) // "8.3.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/opendev-org/openstack/python-openstackclient.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const opendevorgopenstackpythonopenstackclientPackage = {
  /**
   * The display name of this package.
   */
  name: 'openstack' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'opendev.org/openstack/python-openstackclient' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/opendev.org/openstack/python-openstackclient/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install opendev.org/openstack/python-openstackclient' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +opendev.org/openstack/python-openstackclient -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install opendev.org/openstack/python-openstackclient' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'openstack',
    'openstack-inventory',
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
    'python.org@^3',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '8.3.0',
    '8.2.0',
    '8.1.0',
    '8.0.0',
    '7.5.0',
    '7.4.0',
    '7.3.1',
    '7.3.0',
    '7.2.1',
    '7.2.0',
    '7.1.4',
    '7.1.3',
    '7.1.2',
    '7.1.1',
    '7.1.0',
    '7.0.0',
    '6.6.1',
    '6.6.0',
    '6.5.0',
    '6.4.0',
    '6.3.0',
    '6.2.1',
    '6.0.1',
  ] as const,
  aliases: [] as const,
}

export type OpendevorgopenstackpythonopenstackclientPackage = typeof opendevorgopenstackpythonopenstackclientPackage
