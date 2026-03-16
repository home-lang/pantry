/**
 * **session-manager-plugin** - pkgx package
 *
 * @domain `aws.amazon.com/session-manager-plugin`
 * @programs `session-manager-plugin`
 * @version `1.2.779.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install aws.amazon.com/session-manager-plugin`
 * @buildDependencies `go.dev@1.23`, `gnu.org/make` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.awsamazoncomsessionmanagerplugin
 * console.log(pkg.name)        // "session-manager-plugin"
 * console.log(pkg.programs)    // ["session-manager-plugin"]
 * console.log(pkg.versions[0]) // "1.2.779.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/aws-amazon-com/session-manager-plugin.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const awsamazoncomsessionmanagerpluginPackage = {
  /**
  * The display name of this package.
  */
  name: 'session-manager-plugin' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'aws.amazon.com/session-manager-plugin' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/aws.amazon.com/session-manager-plugin/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install aws.amazon.com/session-manager-plugin' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +aws.amazon.com/session-manager-plugin -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install aws.amazon.com/session-manager-plugin' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'session-manager-plugin',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@1.23',
    'gnu.org/make',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.2.779.0',
    '1.2.764.0',
  ] as const,
  aliases: [] as const,
}

export type AwsamazoncomsessionmanagerpluginPackage = typeof awsamazoncomsessionmanagerpluginPackage
