/**
 * **otel-cli** - pkgx package
 *
 * @domain `github.com/equinix-labs/otel-cli`
 * @programs `otel-cli`
 * @version `0.4.5` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/equinix-labs/otel-cli`
 * @buildDependencies `go.dev@~1.21.1` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomequinixlabsotelcli
 * console.log(pkg.name)        // "otel-cli"
 * console.log(pkg.programs)    // ["otel-cli"]
 * console.log(pkg.versions[0]) // "0.4.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/equinix-labs/otel-cli.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const otelcliPackage = {
  /**
  * The display name of this package.
  */
  name: 'otel-cli' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/equinix-labs/otel-cli' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/equinix-labs/otel-cli/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/equinix-labs/otel-cli' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/equinix-labs/otel-cli -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/equinix-labs/otel-cli' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'otel-cli',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@~1.21.1',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.4.5',
  ] as const,
  aliases: [] as const,
}

export type OtelcliPackage = typeof otelcliPackage
