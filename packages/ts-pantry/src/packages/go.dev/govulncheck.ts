/**
 * **govulncheck** - [mirror] the database client and tools for the Go vulnerability database
 *
 * @domain `go.dev/govulncheck`
 * @programs `govulncheck`
 * @version `1.1.4` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install go.dev/govulncheck`
 * @buildDependencies `go.dev@^1.23` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.godevgovulncheck
 * console.log(pkg.name)        // "govulncheck"
 * console.log(pkg.description) // "[mirror] the database client and tools for the ..."
 * console.log(pkg.programs)    // ["govulncheck"]
 * console.log(pkg.versions[0]) // "1.1.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/go-dev/govulncheck.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const godevgovulncheckPackage = {
  /**
   * The display name of this package.
   */
  name: 'govulncheck' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'go.dev/govulncheck' as const,
  /**
   * Brief description of what this package does.
   */
  description: '[mirror] the database client and tools for the Go vulnerability database' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/go.dev/govulncheck/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/golang/vuln' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install go.dev/govulncheck' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +go.dev/govulncheck -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install go.dev/govulncheck' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'govulncheck',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.23',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.1.4',
    '1.1.3',
    '1.1.2',
    '1.1.1',
    '1.1.0',
    '1.0.4',
    '1.0.3',
    '1.0.2',
    '1.0.1',
  ] as const,
  aliases: [] as const,
}

export type GodevgovulncheckPackage = typeof godevgovulncheckPackage
