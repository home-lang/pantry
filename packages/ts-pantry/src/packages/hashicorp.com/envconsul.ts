/**
 * **envconsul** - Launch a subprocess with environment variables using data from @HashiCorp Consul and Vault.
 *
 * @domain `hashicorp.com/envconsul`
 * @programs `envconsul`
 * @version `0.13.4` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install hashicorp.com/envconsul`
 * @homepage https://www.hashicorp.com/
 * @buildDependencies `go.dev@^1.20` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.hashicorpcomenvconsul
 * console.log(pkg.name)        // "envconsul"
 * console.log(pkg.description) // "Launch a subprocess with environment variables ..."
 * console.log(pkg.programs)    // ["envconsul"]
 * console.log(pkg.versions[0]) // "0.13.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/hashicorp-com/envconsul.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const hashicorpcomenvconsulPackage = {
  /**
  * The display name of this package.
  */
  name: 'envconsul' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'hashicorp.com/envconsul' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Launch a subprocess with environment variables using data from @HashiCorp Consul and Vault.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/hashicorp.com/envconsul/package.yml' as const,
  homepageUrl: 'https://www.hashicorp.com/' as const,
  githubUrl: 'https://github.com/hashicorp/envconsul' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install hashicorp.com/envconsul' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +hashicorp.com/envconsul -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install hashicorp.com/envconsul' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'envconsul',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.20',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.13.4',
    '0.13.3',
    '0.13.2',
  ] as const,
  aliases: [] as const,
}

export type HashicorpcomenvconsulPackage = typeof hashicorpcomenvconsulPackage
