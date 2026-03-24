/**
 * **pscale** - The CLI for PlanetScale Database
 *
 * @domain `planetscale.com`
 * @programs `pscale`
 * @version `0.276.0` (99 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install planetscale.com`
 * @homepage https://www.planetscale.com/
 * @buildDependencies `go.dev@~1.22.4` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.planetscalecom
 * console.log(pkg.name)        // "pscale"
 * console.log(pkg.description) // "The CLI for PlanetScale Database"
 * console.log(pkg.programs)    // ["pscale"]
 * console.log(pkg.versions[0]) // "0.276.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/planetscale-com.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const planetscalecomPackage = {
  /**
  * The display name of this package.
  */
  name: 'pscale' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'planetscale.com' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'The CLI for PlanetScale Database' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/planetscale.com/package.yml' as const,
  homepageUrl: 'https://www.planetscale.com/' as const,
  githubUrl: 'https://github.com/planetscale/cli' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install planetscale.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +planetscale.com -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install planetscale.com' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'pscale',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@~1.22.4',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.276.0',
    '0.275.0',
    '0.274.0',
    '0.273.0',
    '0.272.0',
    '0.271.0',
    '0.270.0',
    '0.269.0',
    '0.268.0',
    '0.267.0',
    '0.266.0',
    '0.265.0',
    '0.264.0',
    '0.263.0',
    '0.262.0',
    '0.261.0',
    '0.260.0',
    '0.259.0',
    '0.258.0',
    '0.257.0',
    '0.256.0',
    '0.255.0',
    '0.254.0',
    '0.253.0',
    '0.252.0',
    '0.251.0',
    '0.250.0',
    '0.249.0',
    '0.247.0',
    '0.246.0',
    '0.245.0',
    '0.244.0',
    '0.243.0',
    '0.242.0',
    '0.241.0',
    '0.240.0',
    '0.239.0',
    '0.238.0',
    '0.237.0',
    '0.236.0',
    '0.235.0',
    '0.234.0',
    '0.233.0',
    '0.230.0',
    '0.229.0',
    '0.228.0',
    '0.227.0',
    '0.226.0',
    '0.225.0',
    '0.224.0',
  ] as const,
  aliases: [] as const,
}

export type PlanetscalecomPackage = typeof planetscalecomPackage
