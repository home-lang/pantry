/**
 * **go-redfish-api-idrac** - iDRAC Redfish API client library written in Go.
 *
 * @domain `github.com/greenpau/go-redfish-api-idrac`
 * @programs `go-redfish-api-idrac-client`
 * @version `1.0.6` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/greenpau/go-redfish-api-idrac`
 * @buildDependencies `go.dev` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomgreenpaugoredfishapiidrac
 * console.log(pkg.name)        // "go-redfish-api-idrac"
 * console.log(pkg.description) // "iDRAC Redfish API client library written in Go."
 * console.log(pkg.programs)    // ["go-redfish-api-idrac-client"]
 * console.log(pkg.versions[0]) // "1.0.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/greenpau/go-redfish-api-idrac.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const goredfishapiidracPackage = {
  /**
  * The display name of this package.
  */
  name: 'go-redfish-api-idrac' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/greenpau/go-redfish-api-idrac' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'iDRAC Redfish API client library written in Go.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/greenpau/go-redfish-api-idrac/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/greenpau/go-redfish-api-idrac' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/greenpau/go-redfish-api-idrac' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/greenpau/go-redfish-api-idrac -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/greenpau/go-redfish-api-idrac' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'go-redfish-api-idrac-client',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.0.6',
  ] as const,
  aliases: [] as const,
}

export type GoredfishapiidracPackage = typeof goredfishapiidracPackage
