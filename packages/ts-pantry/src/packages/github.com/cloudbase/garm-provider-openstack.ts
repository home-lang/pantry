/**
 * **cloudbase/garm-provider-openstack** - Garm external provider for OpenStack
 *
 * @domain `github.com/cloudbase/garm-provider-openstack`
 * @programs `garm-provider-openstack`
 * @version `0.1.3` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/cloudbase/garm-provider-openstack`
 * @buildDependencies `go.dev@^1.20` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomcloudbasegarmprovideropenstack
 * console.log(pkg.name)        // "cloudbase/garm-provider-openstack"
 * console.log(pkg.description) // "Garm external provider for OpenStack"
 * console.log(pkg.programs)    // ["garm-provider-openstack"]
 * console.log(pkg.versions[0]) // "0.1.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/cloudbase/garm-provider-openstack.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const garmprovideropenstackPackage = {
  /**
  * The display name of this package.
  */
  name: 'cloudbase/garm-provider-openstack' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/cloudbase/garm-provider-openstack' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Garm external provider for OpenStack' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/cloudbase/garm-provider-openstack/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/cloudbase/garm-provider-openstack' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/cloudbase/garm-provider-openstack' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/cloudbase/garm-provider-openstack -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/cloudbase/garm-provider-openstack' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'garm-provider-openstack',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.20',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.1.3',
    '0.1.2',
    '0.1.1',
    '0.1.0',
  ] as const,
  aliases: [] as const,
}

export type GarmprovideropenstackPackage = typeof garmprovideropenstackPackage
