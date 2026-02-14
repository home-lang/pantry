/**
 * **blowfish** - blowfish is a command line interface for interacting with DMTF Redfish and SNIA Swordfish enabled devices based on gofish
 *
 * @domain `github.com/matoszz/blowfish`
 * @programs `blowfish`
 * @version `0.0.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/matoszz/blowfish`
 * @buildDependencies `go.dev` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcommatoszzblowfish
 * console.log(pkg.name)        // "blowfish"
 * console.log(pkg.description) // "blowfish is a command line interface for intera..."
 * console.log(pkg.programs)    // ["blowfish"]
 * console.log(pkg.versions[0]) // "0.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/matoszz/blowfish.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const blowfishPackage = {
  /**
  * The display name of this package.
  */
  name: 'blowfish' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/matoszz/blowfish' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'blowfish is a command line interface for interacting with DMTF Redfish and SNIA Swordfish enabled devices based on gofish' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/matoszz/blowfish/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/matoszz/blowfish' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/matoszz/blowfish' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/matoszz/blowfish -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/matoszz/blowfish' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'blowfish',
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
    '0.0.0',
  ] as const,
  aliases: [] as const,
}

export type BlowfishPackage = typeof blowfishPackage
