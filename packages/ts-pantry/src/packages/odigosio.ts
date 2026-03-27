/**
 * **odigos** - Distributed tracing without code changes. 🚀 Instantly monitor any application using OpenTelemetry and eBPF
 *
 * @domain `odigos.io`
 * @programs `odigos`
 * @version `1.21.0` (295 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install odigos.io`
 * @homepage https://odigos.io
 * @buildDependencies `go.dev@^1.22` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.odigosio
 * console.log(pkg.name)        // "odigos"
 * console.log(pkg.description) // "Distributed tracing without code changes. 🚀 In..."
 * console.log(pkg.programs)    // ["odigos"]
 * console.log(pkg.versions[0]) // "1.21.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/odigos-io.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const odigosioPackage = {
  /**
  * The display name of this package.
  */
  name: 'odigos' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'odigos.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Distributed tracing without code changes. 🚀 Instantly monitor any application using OpenTelemetry and eBPF' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/odigos.io/package.yml' as const,
  homepageUrl: 'https://odigos.io' as const,
  githubUrl: 'https://github.com/keyval-dev/odigos' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install odigos.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +odigos.io -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install odigos.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'odigos',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.22',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.22.3',
    '1.22.2',
    '1.22.1',
    '1.22.0',
    '1.21.0',
    '1.20.2',
    '1.20.1',
    '1.20.0',
    '1.19.1',
    '1.19.0',
    '1.18.0',
    '1.17.10',
    '1.17.9',
    '1.17.8',
    '1.17.7',
    '1.17.6',
    '1.17.5',
    '1.17.4',
    '1.17.3',
    '1.17.2',
    '1.17.1',
    '1.17.0',
    '1.16.11',
    '1.16.10',
    '1.16.9',
    '1.16.8',
    '1.16.7',
    '1.16.6',
  ] as const,
  aliases: [] as const,
}

export type OdigosioPackage = typeof odigosioPackage
