/**
 * **confd** - Manage local application configuration files using templates and data from etcd or consul
 *
 * @domain `github.com/abtreece/confd`
 * @programs `confd`
 * @version `0.33.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/abtreece/confd`
 * @buildDependencies `go.dev` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomabtreececonfd
 * console.log(pkg.name)        // "confd"
 * console.log(pkg.description) // "Manage local application configuration files us..."
 * console.log(pkg.programs)    // ["confd"]
 * console.log(pkg.versions[0]) // "0.33.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/abtreece/confd.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const confdPackage = {
  /**
   * The display name of this package.
   */
  name: 'confd' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/abtreece/confd' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Manage local application configuration files using templates and data from etcd or consul' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/abtreece/confd/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/kelseyhightower/confd' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/abtreece/confd' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/abtreece/confd -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/abtreece/confd' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'confd',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.33.0',
    '0.32.0',
    '0.30.0',
  ] as const,
  aliases: [] as const,
}

export type ConfdPackage = typeof confdPackage
