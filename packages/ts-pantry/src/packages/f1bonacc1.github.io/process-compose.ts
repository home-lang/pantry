/**
 * **process-compose** - Process Compose is a simple and flexible scheduler and orchestrator to manage non-containerized applications.
 *
 * @domain `f1bonacc1.github.io/process-compose`
 * @programs `process-compose`
 * @version `1.87.0` (22 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install f1bonacc1.github.io/process-compose`
 * @homepage https://f1bonacc1.github.io/process-compose/
 * @buildDependencies `go.dev@=1.24.2` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.f1bonacc1githubioprocesscompose
 * console.log(pkg.name)        // "process-compose"
 * console.log(pkg.description) // "Process Compose is a simple and flexible schedu..."
 * console.log(pkg.programs)    // ["process-compose"]
 * console.log(pkg.versions[0]) // "1.87.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/f1bonacc1-github-io/process-compose.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const f1bonacc1githubioprocesscomposePackage = {
  /**
   * The display name of this package.
   */
  name: 'process-compose' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'f1bonacc1.github.io/process-compose' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Process Compose is a simple and flexible scheduler and orchestrator to manage non-containerized applications.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/f1bonacc1.github.io/process-compose/package.yml' as const,
  homepageUrl: 'https://f1bonacc1.github.io/process-compose/' as const,
  githubUrl: 'https://github.com/F1bonacc1/process-compose' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install f1bonacc1.github.io/process-compose' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +f1bonacc1.github.io/process-compose -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install f1bonacc1.github.io/process-compose' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'process-compose',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@=1.24.2',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.87.0',
    '1.85.0',
    '1.78.0',
    '1.76.1',
    '1.76.0',
    '1.75.2',
    '1.75.1',
    '1.73.0',
    '1.64.1',
    '1.63.0',
    '1.46.0',
    '1.40.1',
    '1.40.0',
    '1.34.0',
    '1.27.0',
    '1.24.2',
    '1.24.0',
    '1.18.0',
    '1.9.0',
    '1.6.1',
    '1.5.0',
    '1.2.0',
  ] as const,
  aliases: [] as const,
}

export type F1bonacc1githubioprocesscomposePackage = typeof f1bonacc1githubioprocesscomposePackage
