/**
 * **temporal** - Command-line interface for running Temporal Server and interacting with Workflows, Activities, Namespaces, and other parts of Temporal
 *
 * @domain `temporal.io`
 * @programs `temporal`
 * @version `1.6.0` (19 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install temporal.io`
 * @homepage https://temporal.io/
 * @buildDependencies `go.dev@^1.19` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.temporalio
 * console.log(pkg.name)        // "temporal"
 * console.log(pkg.description) // "Command-line interface for running Temporal Ser..."
 * console.log(pkg.programs)    // ["temporal"]
 * console.log(pkg.versions[0]) // "1.6.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/temporal-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const temporalioPackage = {
  /**
  * The display name of this package.
  */
  name: 'temporal' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'temporal.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Command-line interface for running Temporal Server and interacting with Workflows, Activities, Namespaces, and other parts of Temporal' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/temporal.io/package.yml' as const,
  homepageUrl: 'https://temporal.io/' as const,
  githubUrl: 'https://github.com/temporalio/cli' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install temporal.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +temporal.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install temporal.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'temporal',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.19',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.6.0',
    '1.5.1',
    '1.5.0',
    '1.4.1',
    '1.4.0',
    '1.3.0',
    '1.2.0',
    '1.1.2',
    '1.1.1',
    '1.1.0',
    '1.0.0',
    '0.13.2',
    '0.13.1',
    '0.13.0',
    '0.12.0',
    '0.11.0',
    '0.10.7',
    '0.10.6',
    '0.10.5',
  ] as const,
  aliases: [] as const,
}

export type TemporalioPackage = typeof temporalioPackage
