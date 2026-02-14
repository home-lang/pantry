/**
 * **kubectl-cnpg** - CloudNativePG is a comprehensive platform designed to seamlessly manage PostgreSQL databases within Kubernetes environments, covering the entire operational lifecycle from initial deployment to ongoing maintenance
 *
 * @domain `cloudnative-pg.io`
 * @programs `kubectl-cnpg`
 * @version `1.28.1` (17 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install cloudnative-pg.io`
 * @homepage https://cloudnative-pg.io/
 * @buildDependencies `go.dev@~1.23` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cloudnativepgio
 * console.log(pkg.name)        // "kubectl-cnpg"
 * console.log(pkg.description) // "CloudNativePG is a comprehensive platform desig..."
 * console.log(pkg.programs)    // ["kubectl-cnpg"]
 * console.log(pkg.versions[0]) // "1.28.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/cloudnative-pg-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cloudnativepgioPackage = {
  /**
  * The display name of this package.
  */
  name: 'kubectl-cnpg' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'cloudnative-pg.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'CloudNativePG is a comprehensive platform designed to seamlessly manage PostgreSQL databases within Kubernetes environments, covering the entire operational lifecycle from initial deployment to ongoing maintenance' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/cloudnative-pg.io/package.yml' as const,
  homepageUrl: 'https://cloudnative-pg.io/' as const,
  githubUrl: 'https://github.com/cloudnative-pg/cloudnative-pg' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install cloudnative-pg.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +cloudnative-pg.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install cloudnative-pg.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'kubectl-cnpg',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@~1.23',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.28.1',
    '1.28.0',
    '1.27.3',
    '1.27.2',
    '1.27.1',
    '1.27.0',
    '1.26.3',
    '1.26.2',
    '1.26.1',
    '1.26.0',
    '1.25.4',
    '1.25.3',
    '1.25.2',
    '1.25.1',
    '1.25.0',
    '1.24.4',
    '1.24.3',
  ] as const,
  aliases: [] as const,
}

export type CloudnativepgioPackage = typeof cloudnativepgioPackage
