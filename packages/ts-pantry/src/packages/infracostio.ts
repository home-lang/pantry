/**
 * **infracost** - Cloud cost estimates for Terraform in pull requests💰📉 Shift FinOps Left!
 *
 * @domain `infracost.io`
 * @programs `infracost`
 * @version `0.10.43` (12 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install infracost.io`
 * @homepage https://www.infracost.io/docs/
 * @buildDependencies `go.dev@^1.19` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.infracostio
 * console.log(pkg.name)        // "infracost"
 * console.log(pkg.description) // "Cloud cost estimates for Terraform in pull requ..."
 * console.log(pkg.programs)    // ["infracost"]
 * console.log(pkg.versions[0]) // "0.10.43" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/infracost-io.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const infracostioPackage = {
  /**
  * The display name of this package.
  */
  name: 'infracost' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'infracost.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Cloud cost estimates for Terraform in pull requests💰📉 Shift FinOps Left!' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/infracost.io/package.yml' as const,
  homepageUrl: 'https://www.infracost.io/docs/' as const,
  githubUrl: 'https://github.com/infracost/infracost' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install infracost.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +infracost.io -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install infracost.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'infracost',
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.10.44',
    '0.10.43',
    '0.10.42',
    '0.10.41',
    '0.10.40',
    '0.10.39',
    '0.10.38',
    '0.10.37',
    '0.10.36',
    '0.10.35',
    '0.10.34',
    '0.10.33',
    '0.10.32',
    '0.10.31',
    '0.10.30',
    '0.10.29',
    '0.10.28',
    '0.10.27',
    '0.10.26',
    '0.10.25',
    '0.10.24',
    '0.10.23',
    '0.10.22',
    '0.10.21',
    '0.10.20',
    '0.10.19',
    '0.10.18',
    '0.10.17',
    '0.10.16',
    '0.10.15',
    '0.10.14',
    '0.10.13',
    '0.10.12',
    '0.10.11',
    '0.10.10',
    '0.10.9',
    '0.10.8',
    '0.10.7',
    '0.10.6',
    '0.10.5',
    '0.10.4',
    '0.10.3',
    '0.10.2',
    '0.10.1',
    '0.10.0',
    '0.9.24',
    '0.9.23',
    '0.9.22',
    '0.9.21',
  ] as const,
  aliases: [] as const,
}

export type InfracostioPackage = typeof infracostioPackage
