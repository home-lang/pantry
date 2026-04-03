/**
 * **daytona** - The Open Source Dev Environment Manager.
 *
 * @domain `daytona.io`
 * @programs `daytona`
 * @version `0.154.0` (149 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install daytona.io`
 * @homepage https://daytona.io
 * @buildDependencies `go.dev@=1.25.4` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.daytonaio
 * console.log(pkg.name)        // "daytona"
 * console.log(pkg.description) // "The Open Source Dev Environment Manager."
 * console.log(pkg.programs)    // ["daytona"]
 * console.log(pkg.versions[0]) // "0.154.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/daytona-io.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const daytonaioPackage = {
  /**
  * The display name of this package.
  */
  name: 'daytona' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'daytona.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'The Open Source Dev Environment Manager.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/daytona.io/package.yml' as const,
  homepageUrl: 'https://daytona.io' as const,
  githubUrl: 'https://github.com/daytonaio/daytona' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install daytona.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +daytona.io -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install daytona.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'daytona',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@=1.25.4',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.161.0',
    '0.160.0',
    '0.159.0',
    '0.158.1',
    '0.158.0',
    '0.157.0',
    '0.156.0',
    '0.155.0',
    '0.154.0',
    '0.153.0',
    '0.152.1',
    '0.152.0',
    '0.151.0',
    '0.150.0',
    '0.149.0',
    '0.148.0',
    '0.147.0',
    '0.146.0',
    '0.145.0',
    '0.144.1',
    '0.144.0',
    '0.143.0',
    '0.142.0',
    '0.141.0',
    '0.140.0',
    '0.139.0',
    '0.138.0',
    '0.137.1',
    '0.137.0',
    '0.136.0',
    '0.135.0',
    '0.134.0',
    '0.133.0',
    '0.132.0',
    '0.131.0',
    '0.130.0',
    '0.129.0',
    '0.128.1',
    '0.128.0',
    '0.127.0',
    '0.126.0',
    '0.125.0',
    '0.124.1',
    '0.124.0',
    '0.123.0',
    '0.122.0',
    '0.121.0',
    '0.120.1',
    '0.120.0',
    '0.119.0',
    '0.118.0',
    '0.117.0',
    '0.116.0',
    '0.115.2',
    '0.115.1',
    '0.115.0',
    '0.114.0',
    '0.113.1',
  ] as const,
  aliases: [] as const,
}

export type DaytonaioPackage = typeof daytonaioPackage
