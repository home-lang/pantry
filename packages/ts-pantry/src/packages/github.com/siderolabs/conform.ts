/**
 * **conform** - Policy enforcement for your pipelines.
 *
 * @domain `github.com/siderolabs/conform`
 * @programs `conform`
 * @version `2022.10.25` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/siderolabs/conform`
 * @buildDependencies `go.dev@^1.19` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomsiderolabsconform
 * console.log(pkg.name)        // "conform"
 * console.log(pkg.description) // "Policy enforcement for your pipelines."
 * console.log(pkg.programs)    // ["conform"]
 * console.log(pkg.versions[0]) // "2022.10.25" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/siderolabs/conform.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const conformPackage = {
  /**
  * The display name of this package.
  */
  name: 'conform' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/siderolabs/conform' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Policy enforcement for your pipelines.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/siderolabs/conform/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/siderolabs/conform' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/siderolabs/conform' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/siderolabs/conform -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/siderolabs/conform' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'conform',
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
    '2022.10.25',
  ] as const,
  aliases: [] as const,
}

export type ConformPackage = typeof conformPackage
