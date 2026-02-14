/**
 * **driftctl** - Detect, track and alert on infrastructure drift
 *
 * @domain `snyk.io/driftctl`
 * @programs `driftctl`
 * @version `0.40.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install snyk.io/driftctl`
 * @buildDependencies `go.dev@^1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.snykiodriftctl
 * console.log(pkg.name)        // "driftctl"
 * console.log(pkg.description) // "Detect, track and alert on infrastructure drift"
 * console.log(pkg.programs)    // ["driftctl"]
 * console.log(pkg.versions[0]) // "0.40.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/snyk-io/driftctl.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const snykiodriftctlPackage = {
  /**
  * The display name of this package.
  */
  name: 'driftctl' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'snyk.io/driftctl' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Detect, track and alert on infrastructure drift' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/snyk.io/driftctl/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/snyk/driftctl' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install snyk.io/driftctl' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +snyk.io/driftctl -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install snyk.io/driftctl' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'driftctl',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.21',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.40.0',
    '0.39.0',
  ] as const,
  aliases: [] as const,
}

export type SnykiodriftctlPackage = typeof snykiodriftctlPackage
